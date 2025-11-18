import { BaseRouter } from '../common/base_router';
import { AdminController } from '../../controllers';
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
  private adminController!: AdminController;

  constructor() {
    super();
  }

  /**
   * Get or create the admin controller instance (lazy initialization)
   */
  private getAdminController(): AdminController {
    if (!this.adminController) {
      const cacheService = VerificationCacheService.getInstance();
      this.adminController = new AdminController(cacheService);
    }
    return this.adminController;
  }

  /**
   * Initialize all admin routes
   */
  protected initializeRoutes(): void {
    const controller = this.getAdminController();

    // GET /api/admin/cache/stats - Get cache statistics
    this.router.get('/cache/stats', controller.getCacheStats);

    // GET /api/admin/cache/blocked - Get blocked IPs
    this.router.get('/cache/blocked', controller.getBlockedIps);

    // GET /api/admin/cache/ip/:ip - Get stats for specific IP
    this.router.get('/cache/ip/:ip', controller.getIpStats);

    // POST /api/admin/cache/block/:ip - Block an IP
    this.router.post('/cache/block/:ip', controller.blockIp);

    // POST /api/admin/cache/unblock/:ip - Unblock an IP
    this.router.post('/cache/unblock/:ip', controller.unblockIp);

    // DELETE /api/admin/cache/ip/:ip - Clear record for IP
    this.router.delete('/cache/ip/:ip', controller.clearIp);
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
   * Get the admin controller instance
   * Useful for testing or accessing controller methods directly
   */
  public getController(): AdminController {
    return this.getAdminController();
  }
}

