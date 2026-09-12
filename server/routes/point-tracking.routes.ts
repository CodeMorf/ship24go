import { Router } from 'express';
import { pool } from '../db/connection';

function parseJson(value: any) {
  try {
    if (!value) return {};
    return typeof value === 'object' ? value : JSON.parse(String(value));
  } catch {
    return {};
  }
}

export const createPointTrackingRouter = () => {
  const router = Router();

  router.get('/:code', async (req, res, next) => {
    try {
      const code = String(req.params.code || '').trim().toUpperCase().slice(0, 80);
      if (!code.startsWith('P24-')) return next();

      const [rows]: any = await pool.query(
        `SELECT i.*, p.name AS point_name, p.city AS point_city, p.country AS point_country,
                s.status AS final_status, s.status_label AS final_status_label, s.updated_at AS final_updated_at
         FROM point_items i
         JOIN partner_points p ON p.id = i.point_id
         LEFT JOIN shipments s ON s.id = i.final_shipment_id
         WHERE i.customer_tracking = ? LIMIT 1`,
        [code]
      );
      const item = rows?.[0];
      if (!item) return next();

      const recipient = parseJson(item.recipient_json);
      const finalDelivered = ['entregado', 'delivered'].includes(String(item.final_status || '').toLowerCase());
      const status = finalDelivered ? 'Entregado' : (item.final_status_label || item.status_label || 'En tránsito');
      const [events]: any = await pool.query(
        `SELECT label, location, event_time FROM point_tracking_events WHERE item_id = ? ORDER BY event_time ASC`,
        [item.id]
      );

      return res.json({
        trackingCode: item.customer_tracking,
        providerTrackingCode: item.customer_tracking,
        destination: [recipient.city, recipient.country || item.destination_country].filter(Boolean).join(', '),
        courier: 'Ship24Go',
        status,
        updatedAt: item.final_updated_at || item.updated_at || item.created_at,
        labelReady: Boolean(item.manifest_id),
        pointShipment: true,
        events: (events || []).map((event: any) => ({
          status: event.label,
          description: event.location || 'Actualización de seguimiento',
          date: event.event_time,
        })),
      });
    } catch (error: any) {
      // If the Point module is not active yet, preserve the existing tracking flow.
      if (['ER_NO_SUCH_TABLE', 'ER_BAD_TABLE_ERROR'].includes(String(error?.code || ''))) return next();
      console.error('[Point Tracking] lookup error', error);
      return res.status(500).json({ error: 'No se pudo consultar el seguimiento en este momento.' });
    }
  });

  return router;
};
