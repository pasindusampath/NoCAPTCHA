import { Request, Response, NextFunction } from 'express';
import { VerificationCacheService } from '../services/verification_cache_service';

/**
 * Controller for Admin endpoints
 * Handles HTTP requests and responses for cache management and blocking
 */
class AdminController {
  private cacheService: VerificationCacheService;

  constructor(cacheService: VerificationCacheService) {
    this.cacheService = cacheService;
  }

  /**
   * GET /api/admin/cache/stats
   * Get cache statistics
   */
  getCacheStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = this.cacheService.getCacheStats();
      res.sendSuccess(stats, 'Cache statistics retrieved', 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/admin/cache/blocked
   * Get blocked IPs
   */
  getBlockedIps = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const blocked = this.cacheService.getBlockedIps();
      res.sendSuccess({ blocked, count: blocked.length }, 'Blocked IPs retrieved', 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/admin/cache/ip/:ip
   * Get stats for specific IP
   */
  getIpStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { ip } = req.params;
      const stats = this.cacheService.getRecordStats(ip);
      res.sendSuccess(stats, 'IP statistics retrieved', 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/admin/cache/block/:ip
   * Block an IP
   */
  blockIp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { ip } = req.params;
      const durationMinutes = req.body?.durationMinutes 
        ? parseInt(req.body.durationMinutes, 10) 
        : undefined;
      
      this.cacheService.blockIp(ip, durationMinutes);
      res.sendSuccess(
        { ip, blocked: true, message: `IP ${ip} has been blocked` },
        'IP blocked successfully',
        200
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/admin/cache/unblock/:ip
   * Unblock an IP
   */
  unblockIp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { ip } = req.params;
      this.cacheService.unblockIp(ip);
      res.sendSuccess(
        { ip, blocked: false, message: `IP ${ip} has been unblocked` },
        'IP unblocked successfully',
        200
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/admin/cache/ip/:ip
   * Clear record for IP
   */
  clearIp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { ip } = req.params;
      this.cacheService.clearRecord(ip);
      res.sendSuccess(
        { ip, message: `Record for IP ${ip} has been cleared` },
        'IP record cleared successfully',
        200
      );
    } catch (error) {
      next(error);
    }
  };
}

export default AdminController;

