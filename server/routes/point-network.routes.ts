import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { pool } from '../db/connection';
import { generateId, hashPassword } from '../db/repos';

let schemaPromise: Promise<void> | null = null;

async function ensurePointSchema() {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      const migrationPath = path.resolve(process.cwd(), 'migrations', 'V26__point_partner_network.sql');
      if (!fs.existsSync(migrationPath)) throw new Error('Point data definition is unavailable');
      await pool.query(fs.readFileSync(migrationPath, 'utf8'));
    })();
  }
  try {
    await schemaPromise;
  } catch (error) {
    schemaPromise = null;
    throw error;
  }
}

function cleanText(value: any, max = 191) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, max);
}

function upperCode(value: any, max = 3) {
  return cleanText(value, max).toUpperCase().replace(/[^A-Z0-9_-]/g, '');
}

function safeJson(value: any, fallback: any = {}) {
  try {
    if (!value) return fallback;
    return typeof value === 'object' ? value : JSON.parse(String(value));
  } catch {
    return fallback;
  }
}

function money(value: any) {
  const numeric = Number(value || 0);
  return Number.isFinite(numeric) ? Math.round((numeric + Number.EPSILON) * 100) / 100 : 0;
}

function randomRef(prefix: string, scope = '') {
  const day = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const token = crypto.randomBytes(8).toString('hex').toUpperCase();
  return [prefix, upperCode(scope, 8), day, token].filter(Boolean).join('-');
}

function publicPoint(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    legalName: row.legal_name,
    country: row.country,
    currency: row.currency,
    city: row.city,
    address: row.address,
    postalCode: row.postal_code,
    phone: row.phone,
    email: row.email,
    status: row.status,
    decisionMode: row.decision_mode,
    hubId: row.hub_id,
    hubName: row.hub_name || null,
    hubCode: row.hub_code || null,
    documentPrice: money(row.document_price),
    cardPrice: money(row.card_price),
    envelopePrice: money(row.envelope_price),
    parcelPrice: money(row.parcel_price),
    documentCommission: money(row.document_commission),
    cardCommission: money(row.card_commission),
    envelopeCommission: money(row.envelope_commission),
    parcelCommission: money(row.parcel_commission),
    parcelEnabled: Boolean(row.parcel_enabled),
    payoutMethod: row.payout_method || 'manual',
    payoutApprovalMode: row.payout_approval_mode || 'manual',
    marketingLicenseEnabled: Boolean(row.marketing_license_enabled),
    marketingLicenseFee: money(row.marketing_license_fee),
    createdAt: row.created_at,
  };
}

function publicItem(row: any) {
  return {
    id: row.id,
    itemType: row.item_type,
    customerTracking: row.customer_tracking,
    receiptNumber: row.receipt_number,
    sender: safeJson(row.sender_json, {}),
    recipient: safeJson(row.recipient_json, {}),
    description: row.description,
    declaredValue: money(row.declared_value),
    servicePrice: money(row.service_price),
    commissionAmount: money(row.commission_amount),
    currency: row.currency,
    destinationCountry: row.destination_country,
    status: row.status,
    statusLabel: row.status_label,
    manifestId: row.manifest_id,
    hubId: row.hub_id,
    createdAt: row.created_at,
    deliveredAt: row.delivered_at,
  };
}

async function pointForUser(userId: string) {
  const [rows]: any = await pool.query(
    `SELECT p.*, h.name AS hub_name, h.code AS hub_code, po.operator_role
     FROM point_operators po
     JOIN partner_points p ON p.id = po.point_id
     LEFT JOIN point_hubs h ON h.id = p.hub_id
     WHERE po.user_id = ? AND po.active = 1
     ORDER BY po.created_at ASC LIMIT 1`,
    [userId]
  );
  return rows?.[0] || null;
}

async function resolveRule(point: any, itemType: string, destinationCountry: string) {
  const [rows]: any = await pool.query(
    `SELECT r.*, h.code AS hub_code, h.name AS hub_name
     FROM point_routing_rules r
     JOIN point_hubs h ON h.id = r.hub_id
     WHERE r.active = 1
       AND r.item_type = ?
       AND r.destination_country = ?
       AND (r.point_id = ? OR r.point_id IS NULL)
       AND (r.origin_country = ? OR r.origin_country IS NULL)
     ORDER BY (r.point_id = ?) DESC, (r.origin_country = ?) DESC, r.priority ASC, r.created_at ASC
     LIMIT 1`,
    [itemType, destinationCountry, point.id, point.country, point.id, point.country]
  );
  return rows?.[0] || null;
}

function ageInDays(value: any) {
  if (!value) return 0;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 0;
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000));
}

async function queueSnapshot(point: any, itemType: string, destinationCountry = 'DO') {
  const rule = await resolveRule(point, itemType, destinationCountry);
  const [rows]: any = await pool.query(
    `SELECT COUNT(*) AS qty, MIN(created_at) AS oldest
     FROM point_items
     WHERE point_id = ? AND item_type = ? AND destination_country = ?
       AND manifest_id IS NULL AND status IN ('received','queued')`,
    [point.id, itemType, destinationCountry]
  );
  const qty = Number(rows?.[0]?.qty || 0);
  const ageDays = ageInDays(rows?.[0]?.oldest);
  const minItems = Math.max(1, Number(rule?.min_items || 1));
  const minDays = Math.max(0, Number(rule?.min_days || 1));
  return { rule, qty, ageDays, minItems, minDays, eligible: qty >= minItems || ageDays >= minDays };
}

async function addEvent(conn: any, itemId: string, eventCode: string, status: string, label: string, location = '', metadata?: any) {
  await conn.query(
    `INSERT INTO point_tracking_events (id, item_id, event_code, status, label, location, metadata_json)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [generateId('pte_'), itemId, eventCode, status, label, cleanText(location, 191) || null, metadata ? JSON.stringify(metadata) : null]
  );
}

async function releaseQueue(point: any, itemType: string, destinationCountry = 'DO', force = false) {
  const rule = await resolveRule(point, itemType, destinationCountry);
  const minItems = Math.max(1, Number(rule?.min_items || 1));
  const minDays = Math.max(0, Number(rule?.min_days || 1));

  if (point.decision_mode === 'approval' && !force) {
    const snapshot = await queueSnapshot(point, itemType, destinationCountry);
    return {
      released: false,
      recommended: snapshot.eligible,
      reason: snapshot.eligible ? 'approval' : 'threshold',
      ...snapshot,
    };
  }

  const hubId = rule?.hub_id || point.hub_id;
  if (!hubId) return { released: false, reason: 'hub', qty: 0, minItems, minDays };

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [hubRows]: any = await conn.query(
      `SELECT * FROM point_hubs WHERE id = ? AND status = 'active' LIMIT 1`,
      [hubId]
    );
    const hub = hubRows?.[0];
    if (!hub) {
      await conn.rollback();
      return { released: false, reason: 'hub', qty: 0, minItems, minDays };
    }

    const [items]: any = await conn.query(
      `SELECT * FROM point_items
       WHERE point_id = ? AND item_type = ? AND destination_country = ?
         AND manifest_id IS NULL AND status IN ('received','queued')
       ORDER BY created_at ASC FOR UPDATE`,
      [point.id, itemType, destinationCountry]
    );

    const qty = Number(items?.length || 0);
    const ageDays = qty ? ageInDays(items[0].created_at) : 0;
    const eligible = force || qty >= minItems || ageDays >= minDays;
    if (!qty || !eligible) {
      await conn.rollback();
      return { released: false, reason: qty ? 'threshold' : 'empty', qty, ageDays, minItems, minDays, eligible: false, rule };
    }

    const manifestId = generateId('pmf_');
    const manifestTracking = randomRef('MNF', hub.code || point.country);
    await conn.query(
      `INSERT INTO point_manifests (id, point_id, hub_id, manifest_tracking, item_type, item_count, status)
       VALUES (?, ?, ?, ?, ?, ?, 'ready')`,
      [manifestId, point.id, hub.id, manifestTracking, itemType, qty]
    );

    const itemIds = items.map((item: any) => item.id);
    const placeholders = itemIds.map(() => '?').join(',');
    await conn.query(
      `UPDATE point_items
       SET manifest_id = ?, hub_id = ?, status = 'consolidated', status_label = 'Consolidado para traslado al hub'
       WHERE id IN (${placeholders})`,
      [manifestId, hub.id, ...itemIds]
    );

    const location = cleanText(`${hub.name}${hub.city ? ` · ${hub.city}` : ''}`, 191);
    for (const item of items) {
      await addEvent(conn, item.id, 'manifest_ready', 'consolidated', 'Consolidado para traslado al hub', location, {
        manifestId,
        manifestTracking,
      });
    }
    await conn.commit();
    return {
      released: true,
      qty,
      ageDays,
      minItems,
      minDays,
      eligible: true,
      rule,
      manifest: { id: manifestId, tracking: manifestTracking, itemCount: qty, hubId: hub.id, hubName: hub.name },
    };
  } catch (error) {
    try { await conn.rollback(); } catch {}
    throw error;
  } finally {
    conn.release();
  }
}

async function commissionBalance(pointId: string) {
  const [commissionRows]: any = await pool.query(
    `SELECT COALESCE(SUM(CASE WHEN status IN ('earned','held','settled') THEN amount ELSE 0 END),0) AS lifetime
     FROM point_commissions WHERE point_id = ?`,
    [pointId]
  );
  const [payoutRows]: any = await pool.query(
    `SELECT COALESCE(SUM(CASE WHEN status IN ('pending','approved','paid') THEN amount ELSE 0 END),0) AS committed,
            COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END),0) AS paid
     FROM point_payout_requests WHERE point_id = ?`,
    [pointId]
  );
  const lifetime = money(commissionRows?.[0]?.lifetime);
  const committed = money(payoutRows?.[0]?.committed);
  return {
    earned: lifetime,
    committed,
    paid: money(payoutRows?.[0]?.paid),
    available: money(Math.max(0, lifetime - committed)),
  };
}

function pointGuard() {
  return async (req: any, res: any, next: any) => {
    try {
      await ensurePointSchema();
      if (req.user?.role === 'super_admin') {
        const pointId = cleanText(req.headers['x-point-id'], 36);
        if (!pointId) return res.status(403).json({ error: 'Selecciona un Point para continuar.' });
        const [rows]: any = await pool.query(
          `SELECT p.*, h.name AS hub_name, h.code AS hub_code
           FROM partner_points p LEFT JOIN point_hubs h ON h.id = p.hub_id
           WHERE p.id = ? LIMIT 1`,
          [pointId]
        );
        req.point = rows?.[0] || null;
      } else {
        req.point = await pointForUser(req.user?.id);
      }
      if (!req.point) return res.status(403).json({ error: 'Esta cuenta no está asociada a un Point activo.' });
      if (req.point.status !== 'active') return res.status(403).json({ error: 'Este Point no está disponible temporalmente.' });
      next();
    } catch (error) {
      console.error('[Point] access error', error);
      res.status(500).json({ error: 'No se pudo cargar la información del Point.' });
    }
  };
}

export const createPointRouter = (authMiddleware: any) => {
  const router = Router();

  router.get('/public/tracking/:code', async (req, res) => {
    try {
      await ensurePointSchema();
      const code = cleanText(req.params.code, 80).toUpperCase();
      const [rows]: any = await pool.query(
        `SELECT i.*, p.name AS point_name, p.city AS point_city, p.country AS point_country,
                s.status AS final_status, s.status_label AS final_status_label
         FROM point_items i
         JOIN partner_points p ON p.id = i.point_id
         LEFT JOIN shipments s ON s.id = i.final_shipment_id
         WHERE i.customer_tracking = ? LIMIT 1`,
        [code]
      );
      const item = rows?.[0];
      if (!item) return res.status(404).json({ error: 'No encontramos un envío con ese tracking.' });
      const delivered = ['entregado', 'delivered'].includes(String(item.final_status || '').toLowerCase());
      const [events]: any = await pool.query(
        `SELECT event_code AS eventCode, status, label, location, event_time AS eventTime
         FROM point_tracking_events WHERE item_id = ? ORDER BY event_time ASC`,
        [item.id]
      );
      res.json({
        tracking: item.customer_tracking,
        itemType: item.item_type,
        status: delivered ? 'delivered' : item.status,
        statusLabel: delivered ? 'Entregado' : (item.final_status_label || item.status_label),
        origin: { point: item.point_name, city: item.point_city, country: item.point_country },
        destinationCountry: item.destination_country,
        createdAt: item.created_at,
        deliveredAt: delivered ? (item.delivered_at || new Date()) : item.delivered_at,
        events: events || [],
      });
    } catch (error) {
      console.error('[Point] public tracking error', error);
      res.status(500).json({ error: 'No se pudo consultar el seguimiento en este momento.' });
    }
  });

  router.use(authMiddleware, pointGuard());

  router.get('/me', async (req: any, res) => {
    const point = req.point;
    res.json({
      point: publicPoint(point),
      operator: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role },
      features: { document: true, card: true, envelope: true, parcel: Boolean(point.parcel_enabled) },
      payoutProfile: { method: point.payout_method || 'manual', details: safeJson(point.payout_details_json, {}) },
    });
  });

  router.get('/dashboard', async (req: any, res) => {
    try {
      const point = req.point;
      const [statsRows]: any = await pool.query(
        `SELECT COUNT(*) AS total,
                SUM(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 ELSE 0 END) AS today,
                SUM(CASE WHEN status IN ('received','queued') THEN 1 ELSE 0 END) AS queued,
                SUM(CASE WHEN status IN ('consolidated','in_transit_to_hub','at_hub','exported','final_mile') THEN 1 ELSE 0 END) AS transit,
                SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered
         FROM point_items WHERE point_id = ?`,
        [point.id]
      );
      const [recent]: any = await pool.query('SELECT * FROM point_items WHERE point_id = ? ORDER BY created_at DESC LIMIT 10', [point.id]);
      const [manifests]: any = await pool.query(
        `SELECT m.*, h.name AS hub_name FROM point_manifests m JOIN point_hubs h ON h.id = m.hub_id
         WHERE m.point_id = ? ORDER BY m.created_at DESC LIMIT 8`,
        [point.id]
      );
      const [payouts]: any = await pool.query('SELECT * FROM point_payout_requests WHERE point_id = ? ORDER BY created_at DESC LIMIT 8', [point.id]);
      const queue: Record<string, any> = {};
      for (const type of ['document', 'card', 'envelope']) {
        const snapshot = await queueSnapshot(point, type, 'DO');
        queue[type] = {
          qty: snapshot.qty,
          ageDays: snapshot.ageDays,
          minItems: snapshot.minItems,
          minDays: snapshot.minDays,
          eligible: snapshot.eligible,
          approvalRequired: point.decision_mode === 'approval',
        };
      }
      const stats = statsRows?.[0] || {};
      res.json({
        point: publicPoint(point),
        summary: {
          total: Number(stats.total || 0),
          today: Number(stats.today || 0),
          queued: Number(stats.queued || 0),
          transit: Number(stats.transit || 0),
          delivered: Number(stats.delivered || 0),
        },
        commission: await commissionBalance(point.id),
        queue,
        recent: (recent || []).map(publicItem),
        manifests: manifests || [],
        payouts: payouts || [],
      });
    } catch (error) {
      console.error('[Point] dashboard error', error);
      res.status(500).json({ error: 'No se pudo cargar el resumen del Point.' });
    }
  });

  router.get('/items', async (req: any, res) => {
    try {
      const [rows]: any = await pool.query('SELECT * FROM point_items WHERE point_id = ? ORDER BY created_at DESC LIMIT 250', [req.point.id]);
      res.json({ items: (rows || []).map(publicItem) });
    } catch (error) {
      console.error('[Point] items error', error);
      res.status(500).json({ error: 'No se pudieron cargar los envíos.' });
    }
  });

  router.post('/items', async (req: any, res) => {
    const point = req.point;
    const itemType = cleanText(req.body?.itemType, 20).toLowerCase();
    if (!['document', 'card', 'envelope', 'parcel'].includes(itemType)) return res.status(400).json({ error: 'Selecciona un tipo de envío válido.' });
    if (itemType === 'parcel' && !point.parcel_enabled) return res.status(400).json({ error: 'Los envíos de paquetes todavía no están disponibles para este Point.' });

    const sender = req.body?.sender || {};
    const recipient = req.body?.recipient || {};
    if (!cleanText(sender.name) || !cleanText(recipient.name)) return res.status(400).json({ error: 'Completa el nombre del remitente y del destinatario.' });
    if (!cleanText(recipient.phone || recipient.email)) return res.status(400).json({ error: 'Agrega un teléfono o correo del destinatario.' });

    const destinationCountry = upperCode(req.body?.destinationCountry || recipient.country || 'DO', 2) || 'DO';
    const priceByType: any = { document: point.document_price, card: point.card_price, envelope: point.envelope_price, parcel: point.parcel_price };
    const commissionByType: any = { document: point.document_commission, card: point.card_commission, envelope: point.envelope_commission, parcel: point.parcel_commission };
    const servicePrice = money(priceByType[itemType]);
    const commissionAmount = money(commissionByType[itemType]);
    const itemId = generateId('pit_');
    const tracking = randomRef('P24', point.country || 'PT');
    const receipt = randomRef('RCP', point.code || point.country || 'PT');

    const conn = await pool.getConnection();
    let createdAt: any = new Date();
    try {
      const rule = await resolveRule(point, itemType, destinationCountry);
      const hubId = rule?.hub_id || point.hub_id || null;
      await conn.beginTransaction();
      await conn.query(
        `INSERT INTO point_items
          (id, point_id, operator_user_id, item_type, customer_tracking, receipt_number, sender_json, recipient_json, description,
           declared_value, service_price, commission_amount, currency, destination_country, hub_id, status, status_label)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'queued', 'Recibido en Point autorizado')`,
        [
          itemId, point.id, req.user.id, itemType, tracking, receipt,
          JSON.stringify(sender), JSON.stringify(recipient), cleanText(req.body?.description, 255) || null,
          money(req.body?.declaredValue), servicePrice, commissionAmount, point.currency || 'EUR', destinationCountry, hubId,
        ]
      );
      await conn.query(
        `INSERT INTO point_commissions (id, point_id, item_id, amount, currency, status)
         VALUES (?, ?, ?, ?, ?, 'earned')`,
        [generateId('pcm_'), point.id, itemId, commissionAmount, point.currency || 'EUR']
      );
      await addEvent(conn, itemId, 'point_received', 'queued', 'Recibido en Point autorizado', `${point.name}${point.city ? ` · ${point.city}` : ''}`);
      await conn.commit();
      const [createdRows]: any = await pool.query('SELECT * FROM point_items WHERE id = ? LIMIT 1', [itemId]);
      createdAt = createdRows?.[0]?.created_at || createdAt;
    } catch (error) {
      try { await conn.rollback(); } catch {}
      console.error('[Point] create item error', error);
      return res.status(500).json({ error: 'No se pudo crear la emisión. Intenta nuevamente.' });
    } finally {
      conn.release();
    }

    let release: any = { released: false, recommended: false };
    try {
      release = await releaseQueue(point, itemType, destinationCountry, false);
    } catch (error) {
      console.error('[Point] post-issuance consolidation error', error);
    }

    return res.status(201).json({
      success: true,
      message: 'Emisión creada correctamente.',
      item: {
        id: itemId,
        itemType,
        customerTracking: tracking,
        receiptNumber: receipt,
        sender,
        recipient,
        description: cleanText(req.body?.description, 255) || null,
        declaredValue: money(req.body?.declaredValue),
        servicePrice,
        commissionAmount,
        currency: point.currency || 'EUR',
        destinationCountry,
        status: 'queued',
        statusLabel: 'Recibido en Point autorizado',
        createdAt,
      },
      receipt: { number: receipt, tracking, price: servicePrice, currency: point.currency || 'EUR', pointName: point.name, createdAt },
      release: { released: Boolean(release.released), recommended: Boolean(release.recommended), manifest: release.manifest || null },
    });
  });

  router.get('/items/:id/receipt', async (req: any, res) => {
    try {
      const [rows]: any = await pool.query('SELECT * FROM point_items WHERE id = ? AND point_id = ? LIMIT 1', [req.params.id, req.point.id]);
      const item = rows?.[0];
      if (!item) return res.status(404).json({ error: 'No encontramos esa emisión.' });
      res.json({
        receipt: {
          number: item.receipt_number,
          tracking: item.customer_tracking,
          itemType: item.item_type,
          sender: safeJson(item.sender_json, {}),
          recipient: safeJson(item.recipient_json, {}),
          description: item.description,
          price: money(item.service_price),
          currency: item.currency,
          pointName: req.point.name,
          pointAddress: req.point.address,
          createdAt: item.created_at,
        },
      });
    } catch (error) {
      console.error('[Point] receipt error', error);
      res.status(500).json({ error: 'No se pudo cargar el recibo.' });
    }
  });

  router.get('/manifests', async (req: any, res) => {
    try {
      const [rows]: any = await pool.query(
        `SELECT m.*, h.name AS hub_name, h.city AS hub_city, h.country AS hub_country
         FROM point_manifests m JOIN point_hubs h ON h.id = m.hub_id
         WHERE m.point_id = ? ORDER BY m.created_at DESC LIMIT 150`,
        [req.point.id]
      );
      res.json({ manifests: rows || [] });
    } catch (error) {
      console.error('[Point] manifests error', error);
      res.status(500).json({ error: 'No se pudieron cargar los manifiestos.' });
    }
  });

  router.post('/payout-profile', async (req: any, res) => {
    try {
      const method = cleanText(req.body?.method, 20).toLowerCase();
      if (!['bank', 'paypal', 'manual'].includes(method)) return res.status(400).json({ error: 'Selecciona una forma de cobro válida.' });
      const details = req.body?.details && typeof req.body.details === 'object' ? req.body.details : {};
      await pool.query('UPDATE partner_points SET payout_method = ?, payout_details_json = ? WHERE id = ?', [method, JSON.stringify(details), req.point.id]);
      res.json({ success: true, message: 'Información de cobro guardada correctamente.' });
    } catch (error) {
      console.error('[Point] payout profile error', error);
      res.status(500).json({ error: 'No se pudo guardar la información de cobro.' });
    }
  });

  router.get('/payouts', async (req: any, res) => {
    try {
      const [rows]: any = await pool.query('SELECT * FROM point_payout_requests WHERE point_id = ? ORDER BY created_at DESC LIMIT 100', [req.point.id]);
      res.json({ payouts: rows || [], commission: await commissionBalance(req.point.id) });
    } catch (error) {
      console.error('[Point] payouts error', error);
      res.status(500).json({ error: 'No se pudo cargar el historial de comisiones.' });
    }
  });

  router.post('/payouts', async (req: any, res) => {
    try {
      const amount = money(req.body?.amount);
      const balance = await commissionBalance(req.point.id);
      if (amount <= 0) return res.status(400).json({ error: 'Ingresa un monto válido.' });
      if (amount > balance.available) return res.status(400).json({ error: 'El monto supera las comisiones disponibles.' });
      const method = ['bank', 'paypal', 'manual'].includes(String(req.point.payout_method)) ? req.point.payout_method : 'manual';
      const status = req.point.payout_approval_mode === 'automatic' ? 'approved' : 'pending';
      const payoutId = generateId('ppy_');
      await pool.query(
        `INSERT INTO point_payout_requests
          (id, point_id, amount, currency, method, status, payout_details_json, requested_by, approved_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          payoutId, req.point.id, amount, req.point.currency || 'EUR', method, status,
          req.point.payout_details_json || null, req.user.id, status === 'approved' ? new Date() : null,
        ]
      );
      res.status(201).json({
        success: true,
        message: status === 'approved' ? 'Solicitud aprobada según la configuración del Point.' : 'Solicitud de pago registrada correctamente.',
        payoutId,
        status,
      });
    } catch (error) {
      console.error('[Point] payout request error', error);
      res.status(500).json({ error: 'No se pudo registrar la solicitud de pago.' });
    }
  });

  return router;
};

function adminGuard(requireAdminOrPermission: any) {
  return requireAdminOrPermission('points.manage');
}

async function adminBootstrap() {
  const [points]: any = await pool.query(
    `SELECT p.*, h.name AS hub_name, h.code AS hub_code,
            (SELECT COUNT(*) FROM point_operators po WHERE po.point_id = p.id AND po.active = 1) AS operators,
            (SELECT COUNT(*) FROM point_items i WHERE i.point_id = p.id) AS item_count,
            (SELECT COALESCE(SUM(c.amount),0) FROM point_commissions c WHERE c.point_id = p.id AND c.status IN ('earned','held','settled')) AS earned_commission
     FROM partner_points p
     LEFT JOIN point_hubs h ON h.id = p.hub_id
     ORDER BY p.created_at DESC`
  );
  const [hubs]: any = await pool.query('SELECT * FROM point_hubs ORDER BY country, city, name');
  const [rules]: any = await pool.query(
    `SELECT r.*, p.name AS point_name, h.name AS hub_name, h.code AS hub_code
     FROM point_routing_rules r
     LEFT JOIN partner_points p ON p.id = r.point_id
     JOIN point_hubs h ON h.id = r.hub_id
     ORDER BY r.priority, r.created_at DESC`
  );
  const [manifests]: any = await pool.query(
    `SELECT m.*, p.name AS point_name, h.name AS hub_name
     FROM point_manifests m
     JOIN partner_points p ON p.id = m.point_id
     JOIN point_hubs h ON h.id = m.hub_id
     ORDER BY m.created_at DESC LIMIT 100`
  );
  const [payouts]: any = await pool.query(
    `SELECT pr.*, p.name AS point_name
     FROM point_payout_requests pr JOIN partner_points p ON p.id = pr.point_id
     ORDER BY pr.created_at DESC LIMIT 100`
  );
  const [summaryRows]: any = await pool.query(
    `SELECT (SELECT COUNT(*) FROM partner_points WHERE status = 'active') AS active_points,
            (SELECT COUNT(*) FROM point_items) AS items,
            (SELECT COUNT(*) FROM point_items WHERE status IN ('received','queued')) AS queued,
            (SELECT COUNT(*) FROM point_manifests WHERE status NOT IN ('closed','cancelled')) AS active_manifests,
            (SELECT COUNT(*) FROM point_payout_requests WHERE status IN ('pending','approved')) AS pending_payouts`
  );
  const [commissionTotals]: any = await pool.query(
    `SELECT currency, COALESCE(SUM(amount),0) AS amount
     FROM point_commissions WHERE status IN ('earned','held','settled') GROUP BY currency ORDER BY currency`
  );
  return {
    summary: summaryRows?.[0] || {},
    commissionTotals: (commissionTotals || []).map((row: any) => ({ currency: row.currency, amount: money(row.amount) })),
    points: (points || []).map((row: any) => ({
      ...publicPoint(row),
      operators: Number(row.operators || 0),
      itemCount: Number(row.item_count || 0),
      earnedCommission: money(row.earned_commission),
    })),
    hubs: hubs || [],
    rules: rules || [],
    manifests: manifests || [],
    payouts: payouts || [],
  };
}

async function findUserByEmail(conn: any, email: string) {
  const [rows]: any = await conn.query('SELECT id, role, status FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1', [email]);
  return rows?.[0] || null;
}

async function attachOperator(conn: any, point: any, payload: any, operatorRole: 'owner' | 'manager' | 'clerk' = 'owner') {
  const email = cleanText(payload?.email || payload?.operatorEmail, 191).toLowerCase();
  const name = cleanText(payload?.name || payload?.operatorName || point.name, 191);
  const password = String(payload?.password || payload?.operatorPassword || '');
  if (!email) throw new Error('POINT_OPERATOR_REQUIRED');

  const existing = await findUserByEmail(conn, email);
  let userId: string;
  if (existing) {
    if (existing.role !== 'point_operator') throw new Error('POINT_EMAIL_IN_USE');
    userId = existing.id;
    await conn.query(`UPDATE users SET status = 'active' WHERE id = ?`, [userId]);
  } else {
    if (password.length < 8) throw new Error('POINT_PASSWORD_REQUIRED');
    userId = generateId('usr_');
    await conn.query(
      `INSERT INTO users (id, email, password_hash, name, phone, country, currency, role, business_type, balance, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'point_operator', 'Ship24Go Point', 0, 'active')`,
      [userId, email, hashPassword(password), name, cleanText(payload?.phone || point.phone, 50), point.country, point.currency]
    );
  }

  await conn.query(
    `INSERT INTO point_operators (point_id, user_id, operator_role, active)
     VALUES (?, ?, ?, 1)
     ON DUPLICATE KEY UPDATE operator_role = VALUES(operator_role), active = 1`,
    [point.id, userId, operatorRole]
  );
  return userId;
}

function operatorError(res: any, error: any) {
  if (error?.message === 'POINT_OPERATOR_REQUIRED') return res.status(400).json({ error: 'Agrega el correo del operador principal.' });
  if (error?.message === 'POINT_PASSWORD_REQUIRED') return res.status(400).json({ error: 'La contraseña del operador debe tener al menos 8 caracteres.' });
  if (error?.message === 'POINT_EMAIL_IN_USE') return res.status(400).json({ error: 'Este correo ya pertenece a otra cuenta. Usa un correo exclusivo para el Point.' });
  return null;
}

export const createAdminPointsRouter = (authMiddleware: any, requireAdminOrPermission: any) => {
  const router = Router();
  router.use(authMiddleware, adminGuard(requireAdminOrPermission));
  router.use(async (_req, res, next) => {
    try {
      await ensurePointSchema();
      next();
    } catch (error) {
      console.error('[Point Admin] initialization error', error);
      res.status(500).json({ error: 'No se pudo abrir la gestión de Points.' });
    }
  });

  router.get('/bootstrap', async (_req, res) => {
    try {
      res.json(await adminBootstrap());
    } catch (error) {
      console.error('[Point Admin] bootstrap error', error);
      res.status(500).json({ error: 'No se pudo cargar la red de Points.' });
    }
  });

  router.post('/hubs', async (req: any, res) => {
    try {
      const name = cleanText(req.body?.name, 120);
      const country = upperCode(req.body?.country, 2);
      if (!name || country.length !== 2) return res.status(400).json({ error: 'Completa el nombre y país del hub.' });
      const code = upperCode(req.body?.code || `${country}-${name.slice(0, 5)}`, 32) || randomRef('HUB', country).slice(0, 32);
      const id = generateId('hub_');
      await pool.query(
        `INSERT INTO point_hubs (id, code, name, country, city, address, postal_code, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
        [id, code, name, country, cleanText(req.body?.city, 120) || null, cleanText(req.body?.address, 255) || null, cleanText(req.body?.postalCode, 24) || null]
      );
      res.status(201).json({ success: true, message: 'Hub creado correctamente.', id });
    } catch (error: any) {
      console.error('[Point Admin] create hub error', error);
      res.status(500).json({ error: error?.code === 'ER_DUP_ENTRY' ? 'Ya existe un hub con ese código.' : 'No se pudo crear el hub.' });
    }
  });

  router.post('/points', async (req: any, res) => {
    const name = cleanText(req.body?.name, 160);
    const country = upperCode(req.body?.country, 2);
    const operatorEmail = cleanText(req.body?.operatorEmail, 191).toLowerCase();
    if (!name || country.length !== 2) return res.status(400).json({ error: 'Completa el nombre y país del Point.' });
    if (!operatorEmail) return res.status(400).json({ error: 'Agrega el correo del operador principal.' });

    const currency = upperCode(req.body?.currency || 'EUR', 3) || 'EUR';
    const pointId = generateId('pnt_');
    const code = upperCode(req.body?.code || `${country}-${name.slice(0, 8)}`, 32) || randomRef('PNT', country).slice(0, 32);
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(
        `INSERT INTO partner_points
          (id, code, name, legal_name, country, currency, city, address, postal_code, phone, email, hub_id, status, decision_mode,
           document_price, card_price, envelope_price, parcel_price, document_commission, card_commission, envelope_commission, parcel_commission,
           parcel_enabled, payout_method, payout_approval_mode, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          pointId, code, name, cleanText(req.body?.legalName, 191) || null, country, currency,
          cleanText(req.body?.city, 120) || null, cleanText(req.body?.address, 255) || null, cleanText(req.body?.postalCode, 24) || null,
          cleanText(req.body?.phone, 60) || null, cleanText(req.body?.email, 191) || operatorEmail,
          cleanText(req.body?.hubId, 36) || null,
          ['approval', 'rules'].includes(req.body?.decisionMode) ? req.body.decisionMode : 'rules',
          money(req.body?.documentPrice), money(req.body?.cardPrice), money(req.body?.envelopePrice), money(req.body?.parcelPrice),
          money(req.body?.documentCommission), money(req.body?.cardCommission), money(req.body?.envelopeCommission), money(req.body?.parcelCommission),
          req.body?.parcelEnabled ? 1 : 0,
          ['bank', 'paypal', 'manual'].includes(req.body?.payoutMethod) ? req.body.payoutMethod : 'manual',
          req.body?.payoutApprovalMode === 'automatic' ? 'automatic' : 'manual', req.user.id,
        ]
      );
      const point = { id: pointId, name, country, currency, phone: cleanText(req.body?.phone, 60) };
      const operatorId = await attachOperator(conn, point, req.body, 'owner');
      await conn.commit();
      res.status(201).json({ success: true, message: 'Point creado correctamente.', pointId, operatorId });
    } catch (error: any) {
      try { await conn.rollback(); } catch {}
      console.error('[Point Admin] create point error', error);
      if (operatorError(res, error)) return;
      res.status(500).json({ error: error?.code === 'ER_DUP_ENTRY' ? 'Ya existe un Point con esos datos.' : 'No se pudo crear el Point.' });
    } finally {
      conn.release();
    }
  });

  router.put('/points/:id', async (req: any, res) => {
    try {
      const allowed: Record<string, string> = {
        name: 'name', legalName: 'legal_name', city: 'city', address: 'address', postalCode: 'postal_code', phone: 'phone', email: 'email', hubId: 'hub_id',
        status: 'status', decisionMode: 'decision_mode', documentPrice: 'document_price', cardPrice: 'card_price', envelopePrice: 'envelope_price', parcelPrice: 'parcel_price',
        documentCommission: 'document_commission', cardCommission: 'card_commission', envelopeCommission: 'envelope_commission', parcelCommission: 'parcel_commission',
        parcelEnabled: 'parcel_enabled', payoutMethod: 'payout_method', payoutApprovalMode: 'payout_approval_mode', marketingLicenseEnabled: 'marketing_license_enabled', marketingLicenseFee: 'marketing_license_fee',
      };
      const validEnums: Record<string, string[]> = {
        status: ['pending', 'active', 'suspended', 'closed'],
        decisionMode: ['rules', 'approval'],
        payoutMethod: ['bank', 'paypal', 'manual'],
        payoutApprovalMode: ['manual', 'automatic'],
      };
      const sets: string[] = [];
      const values: any[] = [];
      for (const [key, column] of Object.entries(allowed)) {
        if (req.body?.[key] === undefined) continue;
        let value: any = req.body[key];
        if (validEnums[key] && !validEnums[key].includes(String(value))) return res.status(400).json({ error: 'Revisa la configuración seleccionada.' });
        if (/Price$|Commission$|Fee$/.test(key)) value = money(value);
        if (['parcelEnabled', 'marketingLicenseEnabled'].includes(key)) value = value ? 1 : 0;
        sets.push(`${column} = ?`);
        values.push(value === '' ? null : value);
      }
      if (!sets.length) return res.json({ success: true, message: 'No hay cambios pendientes.' });
      values.push(req.params.id);
      await pool.query(`UPDATE partner_points SET ${sets.join(', ')} WHERE id = ?`, values);
      res.json({ success: true, message: 'Point actualizado correctamente.' });
    } catch (error) {
      console.error('[Point Admin] update point error', error);
      res.status(500).json({ error: 'No se pudo actualizar el Point.' });
    }
  });

  router.post('/points/:id/operators', async (req: any, res) => {
    const conn = await pool.getConnection();
    try {
      const [pointRows]: any = await conn.query('SELECT * FROM partner_points WHERE id = ? LIMIT 1', [req.params.id]);
      const point = pointRows?.[0];
      if (!point) return res.status(404).json({ error: 'Point no encontrado.' });
      const role = ['owner', 'manager', 'clerk'].includes(req.body?.operatorRole) ? req.body.operatorRole : 'clerk';
      await conn.beginTransaction();
      await attachOperator(conn, point, req.body, role);
      await conn.commit();
      res.status(201).json({ success: true, message: 'Operador asociado correctamente.' });
    } catch (error: any) {
      try { await conn.rollback(); } catch {}
      console.error('[Point Admin] operator error', error);
      if (operatorError(res, error)) return;
      res.status(500).json({ error: 'No se pudo asociar el operador.' });
    } finally {
      conn.release();
    }
  });

  router.post('/rules', async (req: any, res) => {
    try {
      const itemType = cleanText(req.body?.itemType, 20).toLowerCase();
      const hubId = cleanText(req.body?.hubId, 36);
      if (!['document', 'card', 'envelope', 'parcel'].includes(itemType) || !hubId) return res.status(400).json({ error: 'Completa el tipo de envío y el hub.' });
      const id = generateId('prl_');
      await pool.query(
        `INSERT INTO point_routing_rules
          (id, point_id, origin_country, destination_country, item_type, min_items, min_days, hub_id, priority, active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          id, cleanText(req.body?.pointId, 36) || null, upperCode(req.body?.originCountry, 2) || null,
          upperCode(req.body?.destinationCountry || 'DO', 2) || 'DO', itemType,
          Math.max(1, Number(req.body?.minItems || 1)), Math.max(0, Number(req.body?.minDays ?? 1)), hubId,
          Math.max(1, Number(req.body?.priority || 100)),
        ]
      );
      res.status(201).json({ success: true, message: 'Regla de salida creada correctamente.', id });
    } catch (error) {
      console.error('[Point Admin] create rule error', error);
      res.status(500).json({ error: 'No se pudo crear la regla de salida.' });
    }
  });

  router.put('/rules/:id', async (req: any, res) => {
    try {
      await pool.query(
        `UPDATE point_routing_rules SET min_items = ?, min_days = ?, priority = ?, active = ?, hub_id = ? WHERE id = ?`,
        [
          Math.max(1, Number(req.body?.minItems || 1)), Math.max(0, Number(req.body?.minDays ?? 0)),
          Math.max(1, Number(req.body?.priority || 100)), req.body?.active === false ? 0 : 1,
          cleanText(req.body?.hubId, 36), req.params.id,
        ]
      );
      res.json({ success: true, message: 'Regla actualizada correctamente.' });
    } catch (error) {
      console.error('[Point Admin] update rule error', error);
      res.status(500).json({ error: 'No se pudo actualizar la regla.' });
    }
  });

  router.post('/queue/release', async (req: any, res) => {
    try {
      const [rows]: any = await pool.query('SELECT * FROM partner_points WHERE id = ? LIMIT 1', [cleanText(req.body?.pointId, 36)]);
      const point = rows?.[0];
      if (!point) return res.status(404).json({ error: 'Point no encontrado.' });
      const itemType = cleanText(req.body?.itemType, 20).toLowerCase();
      if (!['document', 'card', 'envelope', 'parcel'].includes(itemType)) return res.status(400).json({ error: 'Selecciona un tipo de envío válido.' });
      const result = await releaseQueue(point, itemType, upperCode(req.body?.destinationCountry || 'DO', 2) || 'DO', true);
      if (!result.released) return res.status(400).json({ error: result.reason === 'hub' ? 'Asigna un hub antes de preparar la salida.' : 'No hay piezas disponibles para esta salida.' });
      res.json({ success: true, message: 'Salida preparada correctamente.', manifest: result.manifest });
    } catch (error) {
      console.error('[Point Admin] release queue error', error);
      res.status(500).json({ error: 'No se pudo preparar la salida.' });
    }
  });

  async function manifestStep(req: any, res: any, step: 'dispatch' | 'receive' | 'export') {
    try {
      const mapping: any = {
        dispatch: { expected: 'ready', manifestStatus: 'in_transit_to_hub', itemStatus: 'in_transit_to_hub', label: 'En tránsito hacia el hub', event: 'to_hub', date: 'dispatched_at' },
        receive: { expected: 'in_transit_to_hub', manifestStatus: 'at_hub', itemStatus: 'at_hub', label: 'Recibido en hub', event: 'hub_received', date: 'received_at' },
        export: { expected: 'at_hub', manifestStatus: 'exported', itemStatus: 'exported', label: 'Salida internacional confirmada', event: 'international_departure', date: 'exported_at' },
      };
      const current = mapping[step];
      const [rows]: any = await pool.query(
        `SELECT m.*, h.name AS hub_name, h.city AS hub_city
         FROM point_manifests m JOIN point_hubs h ON h.id = m.hub_id WHERE m.id = ? LIMIT 1`,
        [req.params.id]
      );
      const manifest = rows?.[0];
      if (!manifest) return res.status(404).json({ error: 'Manifiesto no encontrado.' });
      if (manifest.status !== current.expected) return res.status(400).json({ error: 'Este manifiesto ya avanzó a otra etapa.' });

      const extra: string[] = [];
      const values: any[] = [current.manifestStatus];
      if (step === 'dispatch' && req.body?.originTracking) { extra.push('origin_tracking = ?'); values.push(cleanText(req.body.originTracking, 191)); }
      if (step === 'export' && req.body?.exportTracking) { extra.push('export_tracking = ?'); values.push(cleanText(req.body.exportTracking, 191)); }
      if (step === 'export' && req.body?.localTracking) { extra.push('local_tracking = ?'); values.push(cleanText(req.body.localTracking, 191)); }
      values.push(req.params.id);

      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        await conn.query(
          `UPDATE point_manifests SET status = ?, ${current.date} = NOW()${extra.length ? `, ${extra.join(', ')}` : ''} WHERE id = ? AND status = ?`,
          [...values, current.expected]
        );
        const [items]: any = await conn.query('SELECT id FROM point_items WHERE manifest_id = ?', [req.params.id]);
        await conn.query('UPDATE point_items SET status = ?, status_label = ? WHERE manifest_id = ?', [current.itemStatus, current.label, req.params.id]);
        const location = step === 'receive' || step === 'export' ? `${manifest.hub_name}${manifest.hub_city ? ` · ${manifest.hub_city}` : ''}` : '';
        for (const item of items || []) await addEvent(conn, item.id, current.event, current.itemStatus, current.label, location);
        await conn.commit();
      } catch (error) {
        try { await conn.rollback(); } catch {}
        throw error;
      } finally {
        conn.release();
      }
      res.json({ success: true, message: current.label });
    } catch (error) {
      console.error('[Point Admin] manifest step error', error);
      res.status(500).json({ error: 'No se pudo actualizar el manifiesto.' });
    }
  }

  router.post('/manifests/:id/dispatch', (req, res) => manifestStep(req, res, 'dispatch'));
  router.post('/manifests/:id/receive', (req, res) => manifestStep(req, res, 'receive'));
  router.post('/manifests/:id/export', (req, res) => manifestStep(req, res, 'export'));

  router.post('/items/:id/final-delivery', async (req: any, res) => {
    try {
      const [rows]: any = await pool.query('SELECT * FROM point_items WHERE id = ? LIMIT 1', [req.params.id]);
      const item = rows?.[0];
      if (!item) return res.status(404).json({ error: 'Envío no encontrado.' });
      const shipmentId = cleanText(req.body?.finalShipmentId, 36) || null;
      let finalTracking = cleanText(req.body?.finalShipmentTracking, 191) || null;
      let status = 'final_mile';
      let label = 'Asignado a entrega final';
      if (shipmentId) {
        const [shipmentRows]: any = await pool.query('SELECT id, tracking_code, status FROM shipments WHERE id = ? LIMIT 1', [shipmentId]);
        const shipment = shipmentRows?.[0];
        if (!shipment) return res.status(400).json({ error: 'Selecciona un envío final válido.' });
        finalTracking = finalTracking || shipment.tracking_code || null;
        if (['entregado', 'delivered'].includes(String(shipment.status || '').toLowerCase())) {
          status = 'delivered';
          label = 'Entregado';
        }
      }
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        await conn.query(
          `UPDATE point_items
           SET final_shipment_id = ?, final_shipment_tracking = ?, local_tracking = ?, status = ?, status_label = ?, delivered_at = ?
           WHERE id = ?`,
          [shipmentId, finalTracking, cleanText(req.body?.localTracking, 191) || null, status, label, status === 'delivered' ? new Date() : null, item.id]
        );
        await addEvent(conn, item.id, 'final_delivery_linked', status, label, cleanText(req.body?.location, 191));
        await conn.commit();
      } catch (error) {
        try { await conn.rollback(); } catch {}
        throw error;
      } finally {
        conn.release();
      }
      res.json({ success: true, message: status === 'delivered' ? 'Entrega final confirmada.' : 'Entrega final asociada correctamente.' });
    } catch (error) {
      console.error('[Point Admin] final delivery error', error);
      res.status(500).json({ error: 'No se pudo asociar la entrega final.' });
    }
  });

  router.post('/payouts/:id/approve', async (req: any, res) => {
    try {
      const [result]: any = await pool.query(
        `UPDATE point_payout_requests
         SET status = 'paid', approved_by = ?, approved_at = COALESCE(approved_at, NOW()), paid_at = NOW(), note = ?
         WHERE id = ? AND status IN ('pending','approved')`,
        [req.user.id, cleanText(req.body?.note, 500) || null, req.params.id]
      );
      if (!result.affectedRows) return res.status(404).json({ error: 'Solicitud no disponible para pago.' });
      res.json({ success: true, message: 'Pago de comisión confirmado.' });
    } catch (error) {
      console.error('[Point Admin] approve payout error', error);
      res.status(500).json({ error: 'No se pudo confirmar el pago.' });
    }
  });

  router.post('/payouts/:id/reject', async (req: any, res) => {
    try {
      const [result]: any = await pool.query(
        `UPDATE point_payout_requests
         SET status = 'rejected', approved_by = ?, approved_at = NOW(), note = ?
         WHERE id = ? AND status IN ('pending','approved')`,
        [req.user.id, cleanText(req.body?.note, 500) || null, req.params.id]
      );
      if (!result.affectedRows) return res.status(404).json({ error: 'Solicitud no disponible.' });
      res.json({ success: true, message: 'Solicitud rechazada.' });
    } catch (error) {
      console.error('[Point Admin] reject payout error', error);
      res.status(500).json({ error: 'No se pudo actualizar la solicitud.' });
    }
  });

  router.get('/tracking/:code', async (req, res) => {
    try {
      const code = cleanText(req.params.code, 80).toUpperCase();
      const [rows]: any = await pool.query(
        `SELECT i.*, p.name AS point_name, m.manifest_tracking, m.status AS manifest_status, h.name AS hub_name
         FROM point_items i
         JOIN partner_points p ON p.id = i.point_id
         LEFT JOIN point_manifests m ON m.id = i.manifest_id
         LEFT JOIN point_hubs h ON h.id = i.hub_id
         WHERE i.customer_tracking = ? OR i.receipt_number = ? LIMIT 1`,
        [code, code]
      );
      if (!rows?.[0]) return res.status(404).json({ error: 'No encontramos esa emisión.' });
      const [events]: any = await pool.query('SELECT * FROM point_tracking_events WHERE item_id = ? ORDER BY event_time ASC', [rows[0].id]);
      res.json({
        item: publicItem(rows[0]),
        operation: {
          pointName: rows[0].point_name,
          manifestTracking: rows[0].manifest_tracking,
          manifestStatus: rows[0].manifest_status,
          hubName: rows[0].hub_name,
          localTracking: rows[0].local_tracking,
          finalShipmentId: rows[0].final_shipment_id,
          finalShipmentTracking: rows[0].final_shipment_tracking,
        },
        events: events || [],
      });
    } catch (error) {
      console.error('[Point Admin] tracking lookup error', error);
      res.status(500).json({ error: 'No se pudo consultar la emisión.' });
    }
  });

  router.get('/bootstrap/refresh', async (_req, res) => {
    try {
      res.json(await adminBootstrap());
    } catch (error) {
      console.error('[Point Admin] refresh error', error);
      res.status(500).json({ error: 'No se pudo actualizar la información.' });
    }
  });

  return router;
};
