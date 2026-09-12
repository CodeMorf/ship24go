import { pool } from '../db/connection';
import crypto from 'crypto';

export interface AuditLogEntry {
  userId?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  req?: any;
}

export interface AuditQueryFilter {
  page?: number;
  limit?: number;
  action?: string;
  entityType?: string;
  userEmail?: string;
  startDate?: string;
  endDate?: string;
}

class AuditService {
  /**
   * Logs an action asynchronously without blocking the calling thread.
   */
  public log(entry: AuditLogEntry): void {
    setImmediate(async () => {
      try {
        const id = 'aud_' + crypto.randomBytes(12).toString('hex');
        let ip = entry.ipAddress;
        let ua = entry.userAgent;

        if (entry.req) {
          ip =
            ip ||
            entry.req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
            entry.req.socket?.remoteAddress ||
            entry.req.ip ||
            'unknown';
          ua = ua || entry.req.headers['user-agent'] || 'unknown';

          if (!entry.userId && entry.req.user?.id) {
            entry.userId = entry.req.user.id;
          }
          if (!entry.userEmail && entry.req.user?.email) {
            entry.userEmail = entry.req.user.email;
          }
          if (!entry.userRole && entry.req.user?.role) {
            entry.userRole = entry.req.user.role;
          }
        }

        const detailsJson = entry.details ? JSON.stringify(entry.details) : null;

        await pool.query(
          `INSERT INTO audit_logs (
            id, user_id, user_email, user_role, action, entity_type, entity_id, details, ip_address, user_agent, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            id,
            entry.userId || null,
            entry.userEmail || null,
            entry.userRole || null,
            entry.action,
            entry.entityType,
            entry.entityId || null,
            detailsJson,
            ip || null,
            ua ? ua.slice(0, 255) : null,
          ]
        );
      } catch (err) {
        console.error('[AuditService] Failed to record audit log:', err);
      }
    });
  }

  /**
   * Retrieves paginated audit logs with search filters.
   */
  public async queryLogs(filters: AuditQueryFilter = {}) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(10, Number(filters.limit) || 25));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];

    if (filters.action) {
      conditions.push('action = ?');
      params.push(filters.action);
    }
    if (filters.entityType) {
      conditions.push('entity_type = ?');
      params.push(filters.entityType);
    }
    if (filters.userEmail) {
      conditions.push('user_email LIKE ?');
      params.push(`%${filters.userEmail}%`);
    }
    if (filters.startDate) {
      conditions.push('created_at >= ?');
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      conditions.push('created_at <= ?');
      params.push(filters.endDate);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows]: any = await pool.query(
      `SELECT id, user_id, user_email, user_role, action, entity_type, entity_id, details, ip_address, user_agent, created_at
       FROM audit_logs
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM audit_logs ${whereClause}`,
      params
    );

    const total = Number(countResult[0]?.total || 0);

    return {
      logs: rows.map((r: any) => ({
        ...r,
        details: typeof r.details === 'string' ? JSON.parse(r.details || '{}') : r.details || {},
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Returns quick summary stats of recent activity.
   */
  public async getSummaryStats() {
    const [summary]: any = await pool.query(`
      SELECT 
        COUNT(*) as total_events_today,
        COUNT(DISTINCT user_email) as active_actors_today,
        SUM(CASE WHEN action LIKE '%DELETE%' THEN 1 ELSE 0 END) as deletions_today,
        SUM(CASE WHEN action LIKE '%BULK%' THEN 1 ELSE 0 END) as bulk_actions_today
      FROM audit_logs
      WHERE created_at >= CURDATE()
    `);

    return summary[0] || {
      total_events_today: 0,
      active_actors_today: 0,
      deletions_today: 0,
      bulk_actions_today: 0,
    };
  }
}

export const auditService = new AuditService();
