import { Express } from 'express';
import { createAuditRouter } from './audit.routes';
import { createCacheRouter } from './cache.routes';
import { createQueueRouter } from './queue.routes';
import { createPointRouter, createAdminPointsRouter } from './point.routes';
import { createPointTrackingRouter } from './point-tracking.routes';

export const registerModularRoutes = (
  app: Express,
  authMiddleware: any,
  requireAdminOrPermission: any
) => {
  // Mount modular route groups
  app.use('/api/admin/audit-logs', createAuditRouter(authMiddleware, requireAdminOrPermission));
  app.use('/api/admin/cache', createCacheRouter(authMiddleware, requireAdminOrPermission));
  app.use('/api/admin/queue', createQueueRouter(authMiddleware, requireAdminOrPermission));
  app.use('/api/point', createPointRouter(authMiddleware));
  app.use('/api/admin/points', createAdminPointsRouter(authMiddleware, requireAdminOrPermission));
  // Mounted before the legacy public tracking handler so Point codes can share /api/tracking/:code.
  app.use('/api/tracking', createPointTrackingRouter());

  console.log('[Architecture] Modular route groups mounted: /audit-logs, /cache, /queue, /point, /admin/points, /tracking');
};
