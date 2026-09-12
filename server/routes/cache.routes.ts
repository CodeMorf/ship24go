import { Router } from 'express';
import { cacheService } from '../services/cache.service';

export const createCacheRouter = (authMiddleware: any, requireAdminOrPermission: any) => {
  const router = Router();

  router.get('/stats', authMiddleware, requireAdminOrPermission('settings.manage'), (_req: any, res: any) => {
    res.json(cacheService.getStats());
  });

  router.post('/flush', authMiddleware, requireAdminOrPermission('settings.manage'), (_req: any, res: any) => {
    cacheService.flush();
    res.json({ success: true, message: 'Caché en memoria vaciada con éxito.' });
  });

  return router;
};
