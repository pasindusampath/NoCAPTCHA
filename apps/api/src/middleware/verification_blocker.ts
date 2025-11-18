import { Request, Response, NextFunction } from 'express';
import { VerificationCacheService } from '../services/verification_cache_service';

/**
 * Extended Request interface with verification cache and client IP
 * Used by verification middleware to attach cache service and IP address
 */
export interface VerificationRequest extends Request {
  verificationCache: VerificationCacheService;
  clientIp: string;
}

/**
 * Middleware to check if IP is blocked before processing verification
 * Should be used before the verification controller
 */
export function verificationBlocker(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const cacheService = VerificationCacheService.getInstance();
  
  // Extract IP address
  const forwarded = req.headers['x-forwarded-for'];
  const ipAddress = forwarded
    ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0]).trim()
    : req.ip || req.socket.remoteAddress || 'unknown';

  // Check if IP is blocked
  if (cacheService.isBlocked(ipAddress)) {
    const stats = cacheService.getRecordStats(ipAddress);
    
    res.status(429).json({
      success: false,
      error: 'Too many verification attempts. Please try again later.',
      details: {
        blocked: true,
        blockUntil: stats.blockUntil,
        failedAttempts: stats.failedAttempts,
        message: `IP address has been temporarily blocked due to suspicious activity. Block expires at ${stats.blockUntil?.toISOString()}`,
      },
    });
    return;
  }

  // Check rate limit (too many attempts in time window)
  const remainingAttempts = cacheService.getRemainingAttempts(ipAddress);
  if (remainingAttempts <= 0) {
    res.status(429).json({
      success: false,
      error: 'Rate limit exceeded. Please slow down your requests.',
      details: {
        rateLimited: true,
        message: 'Too many verification attempts in a short time. Please wait before trying again.',
      },
    });
    return;
  }

  // Attach cache service and IP to request for use in controller
  (req as VerificationRequest).verificationCache = cacheService;
  (req as VerificationRequest).clientIp = ipAddress;
  
  next();
}

/**
 * Middleware to record verification attempt after processing
 * Should be used after verification is complete
 */
export function recordVerificationAttempt(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Store original json method
  const originalJson = res.json.bind(res);

  // Override json to intercept response
  res.json = function (body: unknown) {
    const verificationReq = req as VerificationRequest;
    const cacheService = verificationReq.verificationCache;
    const ipAddress = verificationReq.clientIp;

    if (cacheService && ipAddress && body && typeof body === 'object') {
      // Record attempt based on response
      const responseBody = body as { success?: boolean };
      const requestBody = req.body as { token?: string; page?: string } | undefined;
      const success = responseBody.success === true;
      const token = requestBody?.token;
      const page = requestBody?.page;

      cacheService.recordAttempt(ipAddress, success, token, page);
    }

    // Call original json method
    return originalJson(body);
  };

  next();
}

