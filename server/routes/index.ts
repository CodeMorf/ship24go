import { Express } from 'express';
import { createAuditRouter } from './audit.routes';
import { createCacheRouter } from './cache.routes';
import { createQueueRouter } from './queue.routes';
import { createPointRouter, createAdminPointsRouter } from './point.routes';

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

  console.log('[Architecture] Modular route groups mounted: /audit-logs, /cache, /queue, /point, /admin/points');
};
