import { BaseRouter } from '../common/base_router';
import { VerificationController } from '../../controllers';
import { VerificationService } from '../../services';

// Route path constants
const METRICS_BASE_PATH = '/metrics'; // Full path: /api/metrics (api prefix added by RouterManager)

/**
 * Class-based router for Metrics endpoints
 * Handles metrics retrieval routes
 * 
 * Routes:
 * - GET    /api/metrics  - Get verification metrics
 */
export class MetricsRouter extends BaseRouter {
  private verificationController!: VerificationController;

  constructor() {
    // Call parent constructor first (this will call initializeRoutes)
    super();
  }

  /**
   * Get or create the verification controller instance (lazy initialization)
   */
  private getVerificationController(): VerificationController {
    if (!this.verificationController) {
      const verificationService = VerificationService.getInstance();
      this.verificationController = new VerificationController(verificationService);
    }
    return this.verificationController;
  }

  /**
   * Initialize all metrics routes
   * Called automatically by parent constructor
   */
  protected initializeRoutes(): void {
    const controller = this.getVerificationController();

    // GET /api/metrics - Get verification metrics
    this.router.get(
      '/',
      controller.getMetrics
    );
  }

  /**
   * Get the base path for this router
   * @returns The base path for metrics routes
   */
  public getBasePath(): string {
    return METRICS_BASE_PATH;
  }

  /**
   * Get route information for this router
   * @returns Array of route information with full paths
   */
  public getRouteInfo(): Array<{ path: string; methods: string[] }> {
    // Note: Full path will be /api/metrics (api prefix added by RouterManager)
    return [
      { path: METRICS_BASE_PATH, methods: ['GET'] }
    ];
  }

  /**
   * Get the verification controller instance
   * Useful for testing or accessing controller methods directly
   */
  public getController(): VerificationController {
    return this.getVerificationController();
  }
}

