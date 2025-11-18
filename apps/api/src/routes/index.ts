/**
 * Domain-based hierarchical barrel export for all routes
 * 
 * Structure:
 * - common/    - Base classes and utilities (BaseRouter)
 * - item/      - Item domain routes (ItemRouter)
 * - health/    - Health domain routes (HealthRouter)
 * 
 * Future domains can follow the same pattern:
 * - user/      - User domain routes
 * - order/     - Order domain routes
 */

// Export all routes from their respective domains
export * from './common';
export * from './item';
export * from './health';
export * from './verification';
export * from './admin';

// Export RouterManager
export { RouterManager } from './router_manager';

// Re-export commonly used classes for convenience
export { BaseRouter } from './common/base_router';
export { ItemRouter } from './item/item_router';
export { HealthRouter } from './health/health_router';
export { VerificationRouter } from './verification/verification_router';
export { AdminRouter } from './admin/admin_router';

