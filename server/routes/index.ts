import { Express } from 'express';
import { createAuditRouter } from './audit.routes';
import { createCacheRouter } from './cache.routes';
import { createQueueRouter } from './queue.routes';

export const registerModularRoutes = (
  app: Express,
  authMiddleware: any,
  requireAdminOrPermission: any
) => {
  // Mount modular route groups
  app.use('/api/admin/audit-logs', createAuditRouter(authMiddleware, requireAdminOrPermission));
  app.use('/api/admin/cache', createCacheRouter(authMiddleware, requireAdminOrPermission));
  app.use('/api/admin/queue', createQueueRouter(authMiddleware, requireAdminOrPermission));

  console.log('[Architecture] Modular route groups mounted: /audit-logs, /cache, /queue');
};
