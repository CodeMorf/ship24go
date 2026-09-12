import { Router } from 'express';
import { queueService } from '../services/queue.service';

export const createQueueRouter = (authMiddleware: any, requireAdminOrPermission: any) => {
  const router = Router();

  router.get('/stats', authMiddleware, requireAdminOrPermission('settings.manage'), (_req: any, res: any) => {
    res.json(queueService.getStats());
  });

  return router;
};
