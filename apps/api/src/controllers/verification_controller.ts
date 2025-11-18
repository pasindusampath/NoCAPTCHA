import { Request, Response, NextFunction } from 'express';
import { VerificationService } from '../services';
import { VerifyRequestDto} from '@nx-mono-repo-deployment-test/shared/src/dtos';

/**
 * Controller for Verification endpoints
 * Handles HTTP requests and responses for Turnstile verification and metrics
 */
class VerificationController {
  private verificationService: VerificationService;

  constructor(verificationService: VerificationService) {
    this.verificationService = verificationService;
  }

  /**
   * Extract IP address from request
   * Checks X-Forwarded-For header first (for proxies), then req.ip
   */
  private getClientIp(req: Request): string | undefined {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
      return ips.trim();
    }
    return req.ip || req.socket.remoteAddress;
  }

  /**
   * Extract user agent from request
   */
  private getUserAgent(req: Request): string | undefined {
    return req.headers['user-agent'];
  }

  /**
   * Detect device type from user agent (simple detection)
   */
  private detectDevice(userAgent?: string): string | undefined {
    if (!userAgent) return undefined;

    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'mobile';
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'tablet';
    }
    return 'desktop';
  }

  /**
   * POST /api/verify
   * Verify a Turnstile token and log the attempt
   * Note: Body validation is handled by middleware
   */
  verify = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Body is already validated and transformed to VerifyRequestDto by middleware
      const verifyRequest = req.body as VerifyRequestDto;
      
      const ipAddress = this.getClientIp(req);
      const userAgent = this.getUserAgent(req);
      const device = this.detectDevice(userAgent);

      // Verify token and log attempt
      const result = await this.verificationService.verifyAndLog(
        verifyRequest.token,
        verifyRequest.page,
        ipAddress,
        userAgent,
        device
      );

      if (result.verification.success) {
        res.sendSuccess(result.verification, 'Verification successful', 200);
      } else {
        res.sendError('Verification failed', 400, {
          verification: result.verification,
          errorCodes: result.verification['error-codes'] || [],
        });
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/metrics
   * Retrieve verification metrics with optional filters
   * Query params: startDate, endDate, success, page, limit, offset
   */
  getMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: {
        startDate?: Date;
        endDate?: Date;
        success?: boolean;
        page?: string;
        limit?: number;
        offset?: number;
      } = {};

      // Parse query parameters
      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate as string);
      }
      if (req.query.success !== undefined) {
        filters.success = req.query.success === 'true';
      }
      if (req.query.page) {
        filters.page = req.query.page as string;
      }
      if (req.query.limit) {
        filters.limit = parseInt(req.query.limit as string, 10);
      }
      if (req.query.offset) {
        filters.offset = parseInt(req.query.offset as string, 10);
      }

      const result = await this.verificationService.getMetrics(filters);

      if (result.success && result.data) {
        res.sendSuccess(result.data, 'Metrics retrieved successfully', 200);
      } else {
        res.sendError(result.error || 'Failed to retrieve metrics', 500);
      }
    } catch (error) {
      next(error);
    }
  };
}

export default VerificationController;

