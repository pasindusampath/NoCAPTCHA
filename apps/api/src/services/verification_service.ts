import { VerificationDao } from '../dao';
import { 
  VerifyResponseDto, 
  VerificationMetricsDto, 
  MetricsResponseDto,
  IApiResponse 
} from '@nx-mono-repo-deployment-test/shared';

interface CloudflareTurnstileResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

/**
 * Service layer for Verification business logic
 * Handles Cloudflare Turnstile verification and metrics tracking
 */
class VerificationService {
  private static instance: VerificationService;
  private verificationDao: VerificationDao;
  private readonly secretKey: string;
  private readonly siteKey: string;
  private readonly cloudflareApiUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

  private constructor(verificationDao: VerificationDao) {
    this.verificationDao = verificationDao;
    this.secretKey = process.env.CLOUDFLARE_SECRET_KEY || '';
    this.siteKey = process.env.CLOUDFLARE_SITE_KEY || '';

    if (!this.secretKey) {
      console.warn('⚠️  CLOUDFLARE_SECRET_KEY is not set');
    }
    if (!this.siteKey) {
      console.warn('⚠️  CLOUDFLARE_SITE_KEY is not set');
    }
  }

  /**
   * Get VerificationService singleton instance
   */
  public static getInstance(): VerificationService {
    if (!VerificationService.instance) {
      VerificationService.instance = new VerificationService(VerificationDao.getInstance());
    }
    return VerificationService.instance;
  }

  /**
   * Verify a Turnstile token with Cloudflare API
   * @param token - The Turnstile token to verify
   * @param remoteip - Optional IP address of the user
   * @returns Promise with verification result
   */
  public async verifyTurnstileToken(
    token: string, 
    remoteip?: string
  ): Promise<VerifyResponseDto> {
    try {
      if (!this.secretKey) {
        throw new Error('Cloudflare secret key is not configured');
      }

      const formData = new URLSearchParams();
      formData.append('secret', this.secretKey);
      formData.append('response', token);
      if (remoteip) {
        formData.append('remoteip', remoteip);
      }

      const response = await fetch(this.cloudflareApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error(`Cloudflare API returned status ${response.status}`);
      }

      const data: CloudflareTurnstileResponse = await response.json();

      return new VerifyResponseDto({
        success: data.success,
        challenge_ts: data.challenge_ts,
        hostname: data.hostname,
        'error-codes': data['error-codes'],
        action: data.action,
        cdata: data.cdata,
      });
    } catch (error) {
      console.error('Error in VerificationService.verifyTurnstileToken:', error);
      // Return a failed response on error
      return new VerifyResponseDto({
        success: false,
        'error-codes': ['internal-error'],
      });
    }
  }

  /**
   * Log a verification attempt to the database
   * @param data - Verification attempt data
   * @returns Promise with created metrics record
   */
  public async logVerificationAttempt(data: {
    token: string;
    page?: string;
    success: boolean;
    ipAddress?: string;
    userAgent?: string;
    device?: string;
  }): Promise<VerificationMetricsDto> {
    try {
      return await this.verificationDao.createVerificationRecord(data);
    } catch (error) {
      console.error('Error in VerificationService.logVerificationAttempt:', error);
      throw error;
    }
  }

  /**
   * Get verification metrics with optional filters
   * @param filters - Optional filters for metrics query
   * @returns Promise with metrics response
   */
  public async getMetrics(filters: {
    startDate?: Date;
    endDate?: Date;
    success?: boolean;
    page?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<IApiResponse<MetricsResponseDto>> {
    try {
      const result = await this.verificationDao.getVerificationMetrics(filters);

      const metricsResponse = new MetricsResponseDto({
        metrics: result.metrics,
        total: result.total,
        page: filters.offset && filters.limit 
          ? Math.floor(filters.offset / filters.limit) + 1 
          : undefined,
        limit: filters.limit,
      });

      return {
        success: true,
        data: metricsResponse,
        count: result.total,
      };
    } catch (error) {
      console.error('Error in VerificationService.getMetrics:', error);
      return {
        success: false,
        error: 'Failed to retrieve metrics',
      };
    }
  }

  /**
   * Verify token and log the attempt in one operation
   * @param token - The Turnstile token to verify
   * @param page - Optional page identifier
   * @param ipAddress - Optional IP address
   * @param userAgent - Optional user agent
   * @param device - Optional device identifier
   * @returns Promise with verification result and logged metrics
   */
  public async verifyAndLog(
    token: string,
    page?: string,
    ipAddress?: string,
    userAgent?: string,
    device?: string
  ): Promise<{
    verification: VerifyResponseDto;
    metrics: VerificationMetricsDto;
  }> {
    // Verify token with Cloudflare
    const verification = await this.verifyTurnstileToken(token, ipAddress);

    // Log the attempt
    const metrics = await this.logVerificationAttempt({
      token,
      page,
      success: verification.success,
      ipAddress,
      userAgent,
      device,
    });

    return {
      verification,
      metrics,
    };
  }
}

export default VerificationService;

