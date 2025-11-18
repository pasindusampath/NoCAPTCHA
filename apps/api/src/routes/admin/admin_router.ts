import { BaseRouter } from '../common/base_router';
import { Request, Response, NextFunction } from 'express';
import { VerificationCacheService } from '../../services/verification_cache_service';

// Route path constants
const ADMIN_BASE_PATH = '/admin'; // Full path: /api/admin (api prefix added by RouterManager)

/**
 * Admin router for managing verification cache and blocking
 * 
 * Routes:
 * - GET    /api/admin/cache/stats     - Get cache statistics
 * - GET    /api/admin/cache/blocked    - Get list of blocked IPs
 * - GET    /api/admin/cache/ip/:ip     - Get stats for specific IP
 * - POST   /api/admin/cache/block/:ip  - Manually block an IP
 * - POST   /api/admin/cache/unblock/:ip - Manually unblock an IP
 * - DELETE /api/admin/cache/ip/:ip     - Clear record for IP
 */
export class AdminRouter extends BaseRouter {
  private cacheService: VerificationCacheService;

  constructor() {
    super();
    this.cacheService = VerificationCacheService.getInstance();
  }

  /**
   * Initialize all admin routes
   */
  protected initializeRoutes(): void {
    // GET /api/admin/cache/stats - Get cache statistics
    this.router.get('/cache/stats', this.getCacheStats);

    // GET /api/admin/cache/blocked - Get blocked IPs
    this.router.get('/cache/blocked', this.getBlockedIps);

    // GET /api/admin/cache/ip/:ip - Get stats for specific IP
    this.router.get('/cache/ip/:ip', this.getIpStats);

    // POST /api/admin/cache/block/:ip - Block an IP
    this.router.post('/cache/block/:ip', this.blockIp);

    // POST /api/admin/cache/unblock/:ip - Unblock an IP
    this.router.post('/cache/unblock/:ip', this.unblockIp);

    // DELETE /api/admin/cache/ip/:ip - Clear record for IP
    this.router.delete('/cache/ip/:ip', this.clearIp);
  }

  /**
   * Get base path
   */
  public getBasePath(): string {
    return ADMIN_BASE_PATH;
  }

  /**
   * Get route information
   */
  public getRouteInfo(): Array<{ path: string; methods: string[] }> {
    return [
      { path: `${ADMIN_BASE_PATH}/cache/stats`, methods: ['GET'] },
      { path: `${ADMIN_BASE_PATH}/cache/blocked`, methods: ['GET'] },
      { path: `${ADMIN_BASE_PATH}/cache/ip/:ip`, methods: ['GET', 'DELETE'] },
      { path: `${ADMIN_BASE_PATH}/cache/block/:ip`, methods: ['POST'] },
      { path: `${ADMIN_BASE_PATH}/cache/unblock/:ip`, methods: ['POST'] },
    ];
  }

  /**
   * Route handlers
   */
  private getCacheStats = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const stats = this.cacheService.getCacheStats();
      res.sendSuccess(stats, 'Cache statistics retrieved', 200);
    } catch (error) {
      next(error);
    }
  };

  private getBlockedIps = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const blocked = this.cacheService.getBlockedIps();
      res.sendSuccess({ blocked, count: blocked.length }, 'Blocked IPs retrieved', 200);
    } catch (error) {
      next(error);
    }
  };

  private getIpStats = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { ip } = req.params;
      const stats = this.cacheService.getRecordStats(ip);
      res.sendSuccess(stats, 'IP statistics retrieved', 200);
    } catch (error) {
      next(error);
    }
  };

  private blockIp = (req: Request, res: Response, next: NextFunction): void => {
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

  private unblockIp = (req: Request, res: Response, next: NextFunction): void => {
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

  private clearIp = (req: Request, res: Response, next: NextFunction): void => {
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

