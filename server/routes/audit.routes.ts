import { Router } from 'express';
import { AuditController } from '../controllers/audit.controller';

export const createAuditRouter = (authMiddleware: any, requireAdminOrPermission: any) => {
  const router = Router();

  router.get(
    '/',
    authMiddleware,
    requireAdminOrPermission('settings.manage'),
    AuditController.getLogs
  );

  router.get(
    '/summary',
    authMiddleware,
    requireAdminOrPermission('settings.manage'),
    AuditController.getSummary
  );

  return router;
};
