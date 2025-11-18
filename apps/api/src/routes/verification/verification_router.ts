import { BaseRouter } from '../common/base_router';
import { VerificationController } from '../../controllers';
import { VerificationService } from '../../services';
import { ValidationMiddleware } from '../../middleware';
import { VerifyRequestDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/verification';

// Route path constants
const VERIFICATION_BASE_PATH = '/verify'; // Full path: /api/verify (api prefix added by RouterManager)

/**
 * Class-based router for Verification endpoints
 * Handles all verification-related routes with proper validation and controller binding
 * 
 * Routes:
 * - POST   /api/verify   - Verify Turnstile token and log metrics
 * - GET    /api/metrics  - Get verification metrics
 */
export class VerificationRouter extends BaseRouter {
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
   * Initialize all verification routes
   * Called automatically by parent constructor
   */
  protected initializeRoutes(): void {
    const controller = this.getVerificationController();

    // POST /api/verify - Verify Turnstile token and log metrics
    this.router.post(
      '/',
      ValidationMiddleware.body(VerifyRequestDto),
      controller.verify
    );
  }

  /**
   * Get the base path for this router
   * @returns The base path for verification routes
   */
  public getBasePath(): string {
    return VERIFICATION_BASE_PATH;
  }

  /**
   * Get route information for this router
   * @returns Array of route information with full paths
   */
  public getRouteInfo(): Array<{ path: string; methods: string[] }> {
    // Note: Full path will be /api/verify (api prefix added by RouterManager)
    return [
      { path: VERIFICATION_BASE_PATH, methods: ['POST'] }
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

