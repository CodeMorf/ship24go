import { auditService } from '../services/audit.service';

export class AuditController {
  public static async getLogs(req: any, res: any) {
    try {
      const { page, limit, action, entityType, userEmail, startDate, endDate } = req.query;
      const result = await auditService.queryLogs({
        page: Number(page) || 1,
        limit: Number(limit) || 25,
        action: action ? String(action) : undefined,
        entityType: entityType ? String(entityType) : undefined,
        userEmail: userEmail ? String(userEmail) : undefined,
        startDate: startDate ? String(startDate) : undefined,
        endDate: endDate ? String(endDate) : undefined,
      });

      return res.json(result);
    } catch (err: any) {
      console.error('[AuditController] Error fetching audit logs:', err);
      return res.status(500).json({ error: 'Error al consultar el registro de auditoría.' });
    }
  }

  public static async getSummary(_req: any, res: any) {
    try {
      const summary = await auditService.getSummaryStats();
      return res.json({ summary });
    } catch (err: any) {
      console.error('[AuditController] Error fetching audit summary:', err);
      return res.status(500).json({ error: 'Error al consultar el resumen de auditoría.' });
    }
  }
}
