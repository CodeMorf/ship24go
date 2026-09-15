import { pool } from './connection';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Hashing helper
export function hashPassword(password: string): string {
  const salt = 'ship24go_salt_98765';
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

// Generador de IDs
// - Envios: SHIP-8393-9 (legible; 100k base + reintento / fallback extendido)
// - Resto: relleno hasta max 36 chars (PK char(36))
export function generateId(prefix: string = ''): string {
  const pfx = String(prefix || '');
  if (pfx === 'shp_' || pfx === 'shp' || pfx === 'SHIP-' || pfx === 'SHIP') {
    return generateShipmentId();
  }
  const maxRandomHexLen = Math.max(2, 36 - pfx.length);
  const bytesNeeded = Math.max(1, Math.floor(maxRandomHexLen / 2));
  return `${pfx}${crypto.randomBytes(bytesNeeded).toString('hex')}`;
}

/**
 * ID de envío bonito tipo SHIP-8393-9
 * Formato: SHIP-XXXX-Y  (4 dígitos + 1 dígito)
 * Fallback si colisiona mucho: SHIP-XXXX-YY
 */
export function generateShipmentId(extended = false): string {
  const n4 = String(crypto.randomInt(0, 10000)).padStart(4, '0');
  if (extended) {
    const n2 = String(crypto.randomInt(0, 100)).padStart(2, '0');
    return `SHIP-${n4}-${n2}`;
  }
  const n1 = String(crypto.randomInt(0, 10));
  return `SHIP-${n4}-${n1}`;
}

// Inicialización de la base de datos
export async function initDb() {
  console.log('[MySQL] Inicializando base de datos...');

  const primarySchemaPath = path.resolve(process.cwd(), 'ship24go_mysql_full_schema.sql');
  const fallbackSchemaPath = path.resolve(process.cwd(), 'migrations', 'V1__production_schema.sql');
  const schemaPath = fs.existsSync(primarySchemaPath) ? primarySchemaPath : fallbackSchemaPath;
  if (!fs.existsSync(schemaPath)) {
    throw new Error('No se encontró el archivo SQL de producción.');
  }

  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  await pool.query(schemaSql);

  // Point afiliado: la migración es idempotente para instalaciones nuevas y existentes.
  const pointSchemaPath = path.resolve(process.cwd(), 'migrations', 'V24__point_affiliate_mvp.sql');
  if (fs.existsSync(pointSchemaPath)) {
    await pool.query(fs.readFileSync(pointSchemaPath, 'utf8'));
  }

  // Sembrar Point comercial verificado en Boston, MA (solicitado por usuario)
  try {
    const [existingBoston]: any = await pool.query(
      `SELECT id FROM points WHERE id = 'pnt_boston_cambridge_01' OR google_place_id = 'ChIJGzMvKkV644kR5fC9L_wUo3M' LIMIT 1`
    );
    if (!existingBoston || existingBoston.length === 0) {
      const bostonUserId = 'usr_point_boston_01';
      const [userExists]: any = await pool.query(
        `SELECT id FROM users WHERE id = ? OR email = ? LIMIT 1`,
        [bostonUserId, 'boston.point@ship24go.com']
      );
      if (!userExists || userExists.length === 0) {
        const hashedPassword = await hashPassword('BostonPoint2026!');
        await pool.query(
          `INSERT INTO users (id, name, email, password_hash, role, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, 'point', 'active', NOW(), NOW())`,
          [bostonUserId, 'David Miller (Boston Express)', 'boston.point@ship24go.com', hashedPassword]
        );
      }
      const actualUserId = (userExists && userExists[0]?.id) || bostonUserId;
      await pool.query(
        `INSERT INTO points (
          id, user_id, business_name, contact_name, email, phone, country, currency,
          address_line1, civic_number, city, province, postal_code, formatted_address,
          google_place_id, latitude, longitude, status, review_note, created_at, updated_at
        ) VALUES (
          'pnt_boston_cambridge_01', ?, 'Boston Express Hub & Ship Point', 'David Miller',
          'boston.point@ship24go.com', '+1 617-555-0198', 'US', 'USD',
          '100 Cambridge St', '100', 'Boston', 'MA', '02114',
          '100 Cambridge St, Boston, MA 02114, USA',
          'ChIJGzMvKkV644kR5fC9L_wUo3M', 42.3611450, -71.0610330, 'approved',
          'Punto oficial verificado en Boston, MA - Recepción y emisión de paquetería',
          NOW(), NOW()
        ) ON DUPLICATE KEY UPDATE status = 'approved', updated_at = NOW()`,
        [actualUserId]
      );
      await pool.query(
        `INSERT IGNORE INTO point_products (id, code, name, description, base_price, commission_percent, currency, is_active, sort_order)
         VALUES
           ('pp_us_envelope', 'us_envelope', 'Sobre Express / Documents', 'Sobres, cartas y documentos urgentes', 8.00, 15.000, 'USD', 1, 1),
           ('pp_us_package', 'us_package', 'Paquete Estándar / Parcel', 'Cajas y paquetes hasta 5 kg', 18.00, 10.000, 'USD', 1, 2),
           ('pp_us_box', 'us_box', 'Caja Grande / Heavy Parcel', 'Paquetes de mayor volumen hasta 20 kg', 35.00, 8.000, 'USD', 1, 3)`
      );
      console.log('[MySQL] Boston Point y productos USD sembrados con éxito.');
    }
  } catch (err: any) {
    console.warn('[MySQL] Advertencia sembrando Boston Point:', err?.message || err);
  }

  await pool.query(`CREATE TABLE IF NOT EXISTS admin_settings (
    id INT PRIMARY KEY,
    settings_json JSON NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);


  await pool.query(`CREATE TABLE IF NOT EXISTS email_logs (
    id CHAR(36) PRIMARY KEY,
    shipment_id CHAR(36) NULL,
    user_id CHAR(36) NULL,
    to_email VARCHAR(191) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    language VARCHAR(10) NOT NULL DEFAULT 'es',
    event_code VARCHAR(80) NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    provider_code VARCHAR(80) NULL,
    message_id VARCHAR(191) NULL,
    error_message TEXT NULL,
    payload_json JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at DATETIME NULL,
    INDEX idx_email_logs_shipment (shipment_id, event_code),
    INDEX idx_email_logs_created (created_at),
    UNIQUE KEY uq_email_shipment_event_to (shipment_id, event_code, to_email)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

  // Compatibilidad para instalaciones existentes: asegurar columnas nuevas.
  const compatibilityStatements = [
    `ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS polarWalletProductId VARCHAR(255) NULL`,
    `ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS polarSubscriptionProductId VARCHAR(255) NULL`,
    `ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS polarWebhookId VARCHAR(255) NULL`,
    `ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS polarWebhookSecret VARCHAR(255) NULL`,
    `ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS polarWebhookUrl VARCHAR(255) NULL`,
    `ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS polarEnvironment VARCHAR(30) NULL`,
    `ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS paypalEnvironment VARCHAR(30) NULL DEFAULT 'sandbox'`,
    `ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS paypalWebhookId VARCHAR(255) NULL`,
    `ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS paypalWebhookSecret VARCHAR(255) NULL`,
    `ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS paypalWebhookUrl VARCHAR(255) NULL`,
    `ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS paymentWalletEnabled TINYINT(1) NOT NULL DEFAULT 1`,
    `ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS paymentPolarEnabled TINYINT(1) NOT NULL DEFAULT 1`,
    `ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS paymentPaypalEnabled TINYINT(1) NOT NULL DEFAULT 1`,
    `ALTER TABLE plans ADD COLUMN IF NOT EXISTS wallet_enabled TINYINT(1) NOT NULL DEFAULT 1`,
    `ALTER TABLE plans ADD COLUMN IF NOT EXISTS polar_enabled TINYINT(1) NOT NULL DEFAULT 1`,
    `ALTER TABLE plans ADD COLUMN IF NOT EXISTS paypal_enabled TINYINT(1) NOT NULL DEFAULT 1`,
    `ALTER TABLE plans ADD COLUMN IF NOT EXISTS billing_interval VARCHAR(30) NOT NULL DEFAULT 'month'`,
    `ALTER TABLE plans ADD COLUMN IF NOT EXISTS polar_product_id VARCHAR(255) NULL`,
    `ALTER TABLE plans ADD COLUMN IF NOT EXISTS polar_price_id VARCHAR(255) NULL`,
    `ALTER TABLE plans ADD COLUMN IF NOT EXISTS polar_sync_status VARCHAR(30) NOT NULL DEFAULT 'pending'`,
    `ALTER TABLE plans ADD COLUMN IF NOT EXISTS polar_last_synced_at DATETIME NULL`,
    `ALTER TABLE plans ADD COLUMN IF NOT EXISTS paypal_product_id VARCHAR(255) NULL`,
    `ALTER TABLE plans ADD COLUMN IF NOT EXISTS paypal_plan_id VARCHAR(255) NULL`,
    `ALTER TABLE plans ADD COLUMN IF NOT EXISTS paypal_sync_status VARCHAR(30) NOT NULL DEFAULT 'pending'`,
    `ALTER TABLE plans ADD COLUMN IF NOT EXISTS paypal_last_synced_at DATETIME NULL`,
    `ALTER TABLE payments ADD COLUMN IF NOT EXISTS plan_id CHAR(36) NULL`,
    `ALTER TABLE payments ADD COLUMN IF NOT EXISTS subscription_id CHAR(36) NULL`,
    `ALTER TABLE payments ADD COLUMN IF NOT EXISTS purpose VARCHAR(80) NULL`,
    `ALTER TABLE payments ADD COLUMN IF NOT EXISTS metadata_json JSON NULL`,
    `ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS external_customer_id VARCHAR(191) NULL`,
    `ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS metadata_json JSON NULL`,
    `ALTER TABLE webhook_events ADD COLUMN IF NOT EXISTS processed_status VARCHAR(30) NULL`,
    `ALTER TABLE webhook_events ADD COLUMN IF NOT EXISTS provider_reference VARCHAR(191) NULL`,
    `ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS ecartApiClientId VARCHAR(255) NULL`,
    `ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS ecartClientSecret VARCHAR(255) NULL`,
    `ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS ecartAppUrl VARCHAR(255) NULL`,
    `ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS ecartRedirectUrl VARCHAR(255) NULL`,
    `ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS extra_json JSON NULL`,
    `ALTER TABLE quotes ADD COLUMN IF NOT EXISTS provider_code VARCHAR(80) NULL`,
    `ALTER TABLE shipment_packages ADD COLUMN IF NOT EXISTS manifest_reference VARCHAR(191) NULL`,
    `ALTER TABLE shipments ADD COLUMN IF NOT EXISTS provider_payload_json JSON NULL`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS currency CHAR(3) DEFAULT 'EUR'`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS status ENUM('active','suspended','closed') NOT NULL DEFAULT 'active'`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_payment_method VARCHAR(30) NOT NULL DEFAULT 'wallet'`,
    `ALTER TABLE wallet_topups ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(80) NULL`,
    `ALTER TABLE wallet_topups ADD COLUMN IF NOT EXISTS provider_reference VARCHAR(191) NULL`,
    `ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS status VARCHAR(30) NULL`
  ];
  for (const stmt of compatibilityStatements) {
    try { await pool.query(stmt); } catch (e) { /* MySQL antiguo: el SQL principal ya cubre instalaciones limpias. */ }
  }

  await AdminSettingsRepo.ensureDefaults();

  const [keys]: any = await pool.query('SELECT * FROM api_keys WHERE id = 1');
  if (keys.length === 0) {
    await pool.query(
      `INSERT INTO api_keys (id, googleMaps, genei, parcelAbc, posteItaliane, paccoFacile, paypalClientId, paypalClientSecret, polarApiToken, polarProductId, freeCurrencyApiKey, ecartApiClientId, ecartClientSecret, ecartAppUrl, ecartRedirectUrl)
       VALUES (1, '', '', '', '', '', '', '', '', '', '', '', '', ?, ?)`,
      [process.env.APP_URL || 'https://ship24go.com', `${process.env.APP_URL || 'https://ship24go.com'}/api/integrations/ecartapi/callback`]
    );
  }

  // Super Admin seguro: se crea solo si no existe y si las variables están completas.
  const [admins]: any = await pool.query('SELECT id FROM users WHERE role = "super_admin" LIMIT 1');
  if (admins.length === 0) {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword || adminPassword.length < 12) {
      throw new Error('Configura ADMIN_EMAIL y ADMIN_PASSWORD seguro antes de iniciar producción.');
    }
    await pool.query(
      `INSERT INTO users (id, email, password_hash, name, phone, country, currency, role, business_type, balance, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [generateId('usr_'), adminEmail, hashPassword(adminPassword), 'Super Admin', '', 'ES', 'EUR', 'super_admin', 'Admin', 0.00, 'active']
    );
  }

  console.log('[MySQL] Base de datos lista para producción.');
}

// --- REPOSITORIOS / CRUD ---

// 1. Usuarios (Users)
export const UserRepo = {
  async getAll(): Promise<any[]> {
    const [rows]: any = await pool.query('SELECT * FROM users');
    return rows;
  },

  async getById(id: string): Promise<any | null> {
    const [rows]: any = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async getByEmail(email: string): Promise<any | null> {
    const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  async create(user: any): Promise<void> {
    await pool.query(
      `INSERT INTO users (id, email, password_hash, name, phone, country, currency, role, business_type, balance, card_connected, paypal_connected, paypal_email, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        user.email,
        user.password_hash,
        user.name,
        user.phone || '',
        user.country || 'ES',
        user.currency || 'EUR',
        user.role || 'customer',
        user.business_type || 'Tienda online',
        user.balance || 0.00,
        user.card_connected ? 1 : 0,
        user.paypal_connected ? 1 : 0,
        user.paypal_email || '',
        user.status || 'active'
      ]
    );
  },

  async update(id: string, fields: any): Promise<void> {
    const keys = Object.keys(fields);
    if (keys.length === 0) return;
    const sets = keys.map(k => `${k} = ?`).join(', ');
    const values = keys.map(k => fields[k]);
    values.push(id);
    await pool.query(`UPDATE users SET ${sets} WHERE id = ?`, values);
  },

  async updateBalance(id: string, amount: number): Promise<void> {
    await pool.query('UPDATE users SET balance = balance + ? WHERE id = ?', [amount, id]);
  }
};

// 2. Empresas (Companies) y Direcciones (Pickup Addresses)
export const CompanyRepo = {
  async getByUserId(userId: string): Promise<any | null> {
    const [rows]: any = await pool.query('SELECT * FROM companies WHERE user_id = ?', [userId]);
    return rows[0] || null;
  },

  async create(company: any): Promise<void> {
    await pool.query(
      `INSERT INTO companies (id, user_id, company_name, address, city, zip_code, country, phone, email) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        company.id,
        company.user_id,
        company.company_name || null,
        company.address || null,
        company.city || null,
        company.zip_code || null,
        company.country || 'ES',
        company.phone || null,
        company.email || null
      ]
    );
  }
};

// 3. Tiendas Integradas (Stores)
export const StoreRepo = {
  async getByUserId(userId: string): Promise<any[]> {
    const [rows]: any = await pool.query('SELECT * FROM stores WHERE user_id = ?', [userId]);
    return rows;
  },

  async getAll(): Promise<any[]> {
    const [rows]: any = await pool.query('SELECT * FROM stores');
    return rows;
  },

  async create(store: any): Promise<void> {
    await pool.query(
      `INSERT INTO stores (id, user_id, platform, external_store_id, store_name, status, access_token_enc, refresh_token_enc) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        store.id,
        store.user_id,
        store.platform,
        store.external_store_id || null,
        store.store_name || null,
        store.status || 'connected',
        store.access_token_enc || null,
        store.refresh_token_enc || null
      ]
    );
  }
};

// 4. Configuración de Proveedores (Providers)
function parseProviderConfig(raw: any): any {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try { return JSON.parse(String(raw)); } catch { return {}; }
}

function normalizeProviderConfig(currentRaw: any, incomingRaw: any): any {
  const current = parseProviderConfig(currentRaw);
  const incoming = parseProviderConfig(incomingRaw);
  const next = { ...current, ...incoming };

  const sensitiveFields = ['authToken', 'token', 'apiKey', 'authCode', 'credential', 'clientSecret', 'password'];
  for (const field of sensitiveFields) {
    const value = incoming[field];
    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (!trimmed || trimmed.includes('••') || trimmed.toLowerCase() === 'configured') {
      if (current[field]) next[field] = current[field];
      else delete next[field];
    }
  }

  return next;
}

export const ProviderRepo = {
  async getAll(): Promise<any[]> {
    const [rows]: any = await pool.query('SELECT * FROM providers ORDER BY name ASC');
    return rows;
  },

  async getByCode(code: string): Promise<any | null> {
    const [rows]: any = await pool.query('SELECT * FROM providers WHERE code = ?', [code]);
    return rows[0] || null;
  },

  async updateAll(providers: any[]): Promise<void> {
    for (const p of providers) {
      const code = String(p.code || p.name?.toLowerCase().replace(/\s+/g, '_') || '').trim().toLowerCase();
      if (!code) continue;

      const current = await this.getByCode(code);
      const configJson = normalizeProviderConfig(current?.config_json, p.config_json || p.config || {});

      await pool.query(
        `INSERT INTO providers (id, code, name, is_active, is_connected, margin_percent, currency, config_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          is_active = VALUES(is_active),
          margin_percent = VALUES(margin_percent),
          currency = VALUES(currency),
          config_json = VALUES(config_json),
          updated_at = NOW()`,
        [
          p.id || current?.id || generateId('prv_'),
          code,
          p.name || current?.name || code.toUpperCase(),
          p.is_active !== undefined ? (p.is_active ? 1 : 0) : 1,
          p.is_connected !== undefined ? (p.is_connected ? 1 : 0) : (current?.is_connected || 0),
          p.margin_percent !== undefined ? p.margin_percent : (p.margin !== undefined ? p.margin : (current?.margin_percent || 20.00)),
          String(p.currency || current?.currency || 'EUR').toUpperCase().slice(0, 3),
          JSON.stringify(configJson)
        ]
      );
    }
  }
};


export const DEFAULT_BRAND_SETTINGS = {
  siteName: 'Ship24go',
  shortName: 'Ship24go',
  tagline: 'Inteligencia en Envíos',
  seoTitle: 'Ship24go - Inteligencia en Envíos',
  seoDescription: 'La plataforma inteligente definitiva de envíos ecommerce.',
  seoKeywords: 'envíos ecommerce, logística, tracking, paquetería, cotizador de envíos',
  logoUrl: '',
  faviconUrl: '/icon.svg',
  ogImageUrl: '',
  themeColor: '#2563eb'
};

function parseSettingsJson(raw: any): any {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try { return JSON.parse(String(raw)); } catch { return {}; }
}

function cleanBrandSettings(input: any = {}) {
  const current = { ...DEFAULT_BRAND_SETTINGS, ...(input || {}) };
  const cleanText = (value: any, fallback: string, max = 255) => {
    const text = String(value ?? '').trim();
    return (text || fallback).slice(0, max);
  };
  const cleanUrl = (value: any, fallback = '') => {
    const text = String(value ?? '').trim();
    if (!text) return fallback;
    if (text.startsWith('/') || text.startsWith('https://') || text.startsWith('http://')) return text.slice(0, 600);
    return fallback;
  };
  return {
    siteName: cleanText(current.siteName, DEFAULT_BRAND_SETTINGS.siteName, 120),
    shortName: cleanText(current.shortName, current.siteName || DEFAULT_BRAND_SETTINGS.shortName, 60),
    tagline: cleanText(current.tagline, DEFAULT_BRAND_SETTINGS.tagline, 160),
    seoTitle: cleanText(current.seoTitle, `${current.siteName || DEFAULT_BRAND_SETTINGS.siteName} - ${current.tagline || DEFAULT_BRAND_SETTINGS.tagline}`, 180),
    seoDescription: cleanText(current.seoDescription, DEFAULT_BRAND_SETTINGS.seoDescription, 300),
    seoKeywords: cleanText(current.seoKeywords, DEFAULT_BRAND_SETTINGS.seoKeywords, 500),
    logoUrl: cleanUrl(current.logoUrl, DEFAULT_BRAND_SETTINGS.logoUrl),
    faviconUrl: cleanUrl(current.faviconUrl, DEFAULT_BRAND_SETTINGS.faviconUrl),
    ogImageUrl: cleanUrl(current.ogImageUrl, current.logoUrl || ''),
    themeColor: /^#[0-9a-fA-F]{6}$/.test(String(current.themeColor || '')) ? String(current.themeColor) : DEFAULT_BRAND_SETTINGS.themeColor
  };
}

export const AdminSettingsRepo = {
  async ensureDefaults(): Promise<void> {
    await pool.query('INSERT IGNORE INTO admin_settings (id, settings_json) VALUES (1, JSON_OBJECT())');
    const [rows]: any = await pool.query('SELECT settings_json FROM admin_settings WHERE id = 1');
    const settings = parseSettingsJson(rows?.[0]?.settings_json);
    if (!settings.brand) {
      await this.updateBrand(DEFAULT_BRAND_SETTINGS);
    }
  },

  async get(): Promise<any> {
    const [rows]: any = await pool.query('SELECT settings_json FROM admin_settings WHERE id = 1');
    const settings = parseSettingsJson(rows?.[0]?.settings_json);
    return {
      ...settings,
      brand: cleanBrandSettings(settings.brand || {})
    };
  },

  async updateBrand(brand: any): Promise<any> {
    await this.ensureDefaultsWithoutRecursion();
    const current = await this.get();
    const nextBrand = cleanBrandSettings({ ...(current.brand || {}), ...(brand || {}) });
    const nextSettings = { ...current, brand: nextBrand };
    await pool.query(
      `UPDATE admin_settings SET settings_json = ? WHERE id = 1`,
      [JSON.stringify(nextSettings)]
    );
    return nextBrand;
  },

  async updateAI(ai: any): Promise<any> {
    await this.ensureDefaultsWithoutRecursion();
    const current = await this.get();
    const currentAi = current.ai || {};
    const incoming = ai || {};
    const nextAi = {
      enabled: incoming.enabled !== undefined ? Boolean(incoming.enabled) : (currentAi.enabled !== false),
      model: String(incoming.model || currentAi.model || process.env.OPENAI_MODEL || 'gpt-5.4-mini').trim().slice(0, 80),
      autoTicket: incoming.autoTicket !== undefined ? Boolean(incoming.autoTicket) : (currentAi.autoTicket !== false),
      maxContextRecords: Math.max(5, Math.min(50, Number(incoming.maxContextRecords || currentAi.maxContextRecords || 20))),
      publicProviderWord: 'courier',
      instructions: String(incoming.instructions || currentAi.instructions || '').slice(0, 4000),
      openaiApiKey: currentAi.openaiApiKey || ''
    };
    const incomingKey = String(incoming.openaiApiKey || incoming.apiKey || '').trim();
    if (incomingKey && !incomingKey.includes('••') && incomingKey !== '********') {
      nextAi.openaiApiKey = incomingKey;
    }
    const nextSettings = { ...current, ai: nextAi };
    await pool.query(
      `UPDATE admin_settings SET settings_json = ? WHERE id = 1`,
      [JSON.stringify(nextSettings)]
    );
    return { ...nextAi, openaiApiKey: nextAi.openaiApiKey ? '••••••••' : '', hasKey: Boolean(nextAi.openaiApiKey || process.env.OPENAI_API_KEY) };
  },

  async ensureDefaultsWithoutRecursion(): Promise<void> {
    await pool.query('INSERT IGNORE INTO admin_settings (id, settings_json) VALUES (1, JSON_OBJECT())');
  }
};

// 5. Configuración de Claves de API Globales
export const ApiKeysRepo = {
  async get(): Promise<any> {
    const [rows]: any = await pool.query('SELECT * FROM api_keys WHERE id = 1');
    return rows[0] || null;
  },

  async update(keys: any): Promise<void> {
    await pool.query(
      `UPDATE api_keys SET 
        googleMaps = ?, 
        genei = ?, 
        parcelAbc = ?, 
        posteItaliane = ?, 
        paccoFacile = ?, 
        paypalClientId = ?, 
        paypalClientSecret = ?,
        paypalEnvironment = ?,
        paypalWebhookId = ?,
        paypalWebhookSecret = ?,
        paypalWebhookUrl = ?,
        paymentWalletEnabled = ?,
        paymentPolarEnabled = ?,
        paymentPaypalEnabled = ?,
        polarApiToken = ?, 
        polarProductId = ?, 
        polarWalletProductId = ?,
        polarSubscriptionProductId = ?,
        polarWebhookId = ?,
        polarWebhookSecret = ?,
        polarWebhookUrl = ?,
        polarEnvironment = ?,
        freeCurrencyApiKey = ?,
        ecartApiClientId = ?,
        ecartClientSecret = ?,
        ecartAppUrl = ?,
        ecartRedirectUrl = ?
       WHERE id = 1`,
      [
        keys.googleMaps || '',
        keys.genei || '',
        keys.parcelAbc || '',
        keys.posteItaliane || '',
        keys.paccoFacile || '',
        keys.paypalClientId || '',
        keys.paypalClientSecret || '',
        keys.paypalEnvironment || 'sandbox',
        keys.paypalWebhookId || '',
        keys.paypalWebhookSecret || '',
        keys.paypalWebhookUrl || `${process.env.APP_URL || 'https://ship24go.com'}/api/webhooks/paypal`,
        keys.paymentWalletEnabled === false || keys.paymentWalletEnabled === '0' ? 0 : 1,
        keys.paymentPolarEnabled === false || keys.paymentPolarEnabled === '0' ? 0 : 1,
        keys.paymentPaypalEnabled === false || keys.paymentPaypalEnabled === '0' ? 0 : 1,
        keys.polarApiToken || '',
        keys.polarProductId || '',
        keys.polarWalletProductId || '',
        keys.polarSubscriptionProductId || '',
        keys.polarWebhookId || '',
        keys.polarWebhookSecret || '',
        keys.polarWebhookUrl || '',
        keys.polarEnvironment || 'sandbox',
        keys.freeCurrencyApiKey || '',
        keys.ecartApiClientId || '',
        keys.ecartClientSecret || '',
        keys.ecartAppUrl || 'https://ship24go.com',
        keys.ecartRedirectUrl || 'https://ship24go.com/api/integrations/ecartapi/callback'
      ]
    );
  }
};

// 6. Planes (Plans)
export const PlanRepo = {
  async getAll(): Promise<any[]> {
    const [rows]: any = await pool.query('SELECT * FROM plans');
    return rows;
  },

  async updateAll(plans: any[]): Promise<void> {
    for (const p of plans) {
      await pool.query(
        `INSERT INTO plans (id, code, name, price, currency, discount_percent, features_json, is_active, billing_interval, polar_product_id, polar_price_id, polar_sync_status, paypal_product_id, paypal_plan_id, paypal_sync_status, wallet_enabled, polar_enabled, paypal_enabled) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE 
          name = VALUES(name), 
          price = VALUES(price), 
          currency = VALUES(currency),
          discount_percent = VALUES(discount_percent),
          features_json = VALUES(features_json),
          is_active = VALUES(is_active),
          billing_interval = VALUES(billing_interval),
          polar_product_id = VALUES(polar_product_id),
          polar_price_id = VALUES(polar_price_id),
          polar_sync_status = VALUES(polar_sync_status),
          paypal_product_id = VALUES(paypal_product_id),
          paypal_plan_id = VALUES(paypal_plan_id),
          paypal_sync_status = VALUES(paypal_sync_status),
          wallet_enabled = VALUES(wallet_enabled),
          polar_enabled = VALUES(polar_enabled),
          paypal_enabled = VALUES(paypal_enabled)`,
        [
          p.id,
          p.code || p.name.toLowerCase().replace(/\s+/g, '_'),
          p.name,
          p.price || 0.00,
          p.currency || 'USD',
          p.discount !== undefined ? p.discount : (p.discount_percent || 0.00),
          typeof p.features_json === 'string' ? p.features_json : JSON.stringify(p.features || []),
          p.is_active !== undefined ? (p.is_active ? 1 : 0) : 1,
          p.billing_interval || 'month',
          p.polar_product_id || p.polarProductId || '',
          p.polar_price_id || p.polarPriceId || '',
          p.polar_sync_status || p.polarSyncStatus || 'pending',
          p.paypal_product_id || p.paypalProductId || '',
          p.paypal_plan_id || p.paypalPlanId || '',
          p.paypal_sync_status || p.paypalSyncStatus || 'pending',
          p.wallet_enabled === false || p.wallet_enabled === '0' || p.walletEnabled === false ? 0 : 1,
          p.polar_enabled === false || p.polar_enabled === '0' || p.polarEnabled === false ? 0 : 1,
          p.paypal_enabled === false || p.paypal_enabled === '0' || p.paypalEnabled === false ? 0 : 1
        ]
      );
    }
  }
};

// 7. Envíos (Shipments) y Paquetes (Packages)
export const ShipmentRepo = {
  async getAll(): Promise<any[]> {
    const [rows]: any = await pool.query('SELECT * FROM shipments ORDER BY created_at DESC');
    return rows;
  },

  async getByUserId(userId: string): Promise<any[]> {
    const [rows]: any = await pool.query('SELECT * FROM shipments WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    return rows;
  },

  async getById(id: string): Promise<any | null> {
    const [rows]: any = await pool.query('SELECT * FROM shipments WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async getByTrackingCode(trackingCode: string): Promise<any | null> {
    const [rows]: any = await pool.query('SELECT * FROM shipments WHERE tracking_code = ?', [trackingCode]);
    return rows[0] || null;
  },

  async create(shipment: any): Promise<void> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      if (shipment.walletDeduction && Number(shipment.walletDeduction) > 0) {
        const [walletRows]: any = await conn.query('SELECT balance FROM users WHERE id = ? FOR UPDATE', [shipment.user_id]);
        const currentBalance = Number(walletRows?.[0]?.balance || 0);
        const debitAmount = Number(shipment.walletDeduction);
        if (currentBalance < debitAmount) {
          throw new Error('Saldo insuficiente para completar este envío.');
        }
        await conn.query('UPDATE users SET balance = balance - ? WHERE id = ?', [debitAmount, shipment.user_id]);
        await conn.query(
          `INSERT INTO wallet_transactions (id, user_id, type, amount, currency, description, reference_type, reference_id)
           VALUES (?, ?, 'debit', ?, ?, ?, ?, ?)`,
          [
            generateId('wtx_'),
            shipment.user_id,
            debitAmount,
            shipment.currency || 'EUR',
            shipment.walletDescription || `Cargo por envío ${shipment.tracking_code}`,
            'shipment',
            shipment.id
          ]
        );
      }

      await conn.query(
        `INSERT INTO shipments (
          id, user_id, quote_id, provider_id, provider_code, provider_shipment_code, provider_tracking_code,
          tracking_code, order_number, reference, status, status_label, sender_json, recipient_json, label_url, label_base64, track_url, payment_url, provider_payload_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          shipment.id,
          shipment.user_id,
          shipment.quote_id || null,
          shipment.provider_id || null,
          shipment.provider_code || null,
          shipment.provider_shipment_code || null,
          shipment.provider_tracking_code || null,
          shipment.tracking_code,
          shipment.order_number || null,
          shipment.reference || null,
          shipment.status || 'created',
          shipment.status_label || 'Creado',
          JSON.stringify(shipment.sender || {}),
          JSON.stringify(shipment.recipient || {}),
          shipment.label_url || null,
          shipment.label_base64 || null,
          shipment.track_url || null,
          shipment.payment_url || null,
          shipment.provider_payload_json ? JSON.stringify(shipment.provider_payload_json) : null
        ]
      );

      const insertAddress = async (type: 'sender' | 'recipient', addr: any) => {
        await conn.query(
          `INSERT INTO shipment_addresses (id, shipment_id, type, full_name, company, country, city, zip_code, address, civic_number, formatted_address, google_place_id, phone, email, observations)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            generateId('adr_'), shipment.id, type,
            addr?.name || addr?.full_name || '', addr?.company || '', addr?.country || 'ES', addr?.city || '',
            addr?.zipCode || addr?.post_code || '', addr?.address || addr?.addressLine1 || '', addr?.civicNumber || '', addr?.formattedAddress || addr?.address || addr?.addressLine1 || '', addr?.googlePlaceId || '', addr?.phone || '', addr?.email || '', addr?.observations || ''
          ]
        );
      };
      await insertAddress('sender', shipment.sender || {});
      await insertAddress('recipient', shipment.recipient || {});

      const pkgs = Array.isArray(shipment.packages) && shipment.packages.length > 0
        ? shipment.packages
        : [{ width: 10, height: 10, length: 10, weight: 1, qty: 1 }];

      for (const p of pkgs) {
        const pkgId = generateId('pkg_');
        await conn.query(
          `INSERT INTO shipment_packages (
            id, shipment_id, package_code, manifest_reference, final_mile_code, final_mile_url,
            width_cm, height_cm, length_cm, weight_kg, quantity, label_url, provider_payload_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            pkgId,
            shipment.id,
            p.packageCode || p.package_code || null,
            p.manifestReference || p.manifest_reference || null,
            p.finalMile || p.final_mile_code || null,
            p.finalMileUrl || p.final_mile_url || null,
            Number(p.width || p.width_cm || 10),
            Number(p.height || p.height_cm || 10),
            Number(p.length || p.length_cm || 10),
            Number(p.weight || p.weight_kg || 1),
            Number(p.qty || p.quantity || 1),
            p.labelUrl || p.label_url || null,
            p.providerPayload ? JSON.stringify(p.providerPayload) : null
          ]
        );

        if (Array.isArray(p.customs)) {
          for (const c of p.customs) {
            await conn.query(
              `INSERT INTO shipment_customs_items (
                id, shipment_package_id, description, origin_country, quantity, weight_kg, value_amount, hs_code, sku, export_reason, terms_of_trade
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                generateId('cst_'),
                pkgId,
                c.description || 'Goods',
                c.origin || c.origin_country || 'ES',
                Number(c.quantity || 1),
                Number(c.weight || c.weight_kg || 0.25),
                Number(c.value || c.value_amount || 1.5),
                c.hsCode || c.itemhscode || c.hs_code || '',
                c.sku || c.itemsku || '',
                c.exportReason || c.export_reason || 'Sale',
                c.termsOfTrade || c.terms_of_trade || 'DAP'
              ]
            );
          }
        }
      }

      if (shipment.status === 'draft') {
        await conn.query(
          `INSERT INTO shipment_drafts (id, shipment_id, user_id, quote_id, reason, payload_json, status)
           VALUES (?, ?, ?, ?, ?, ?, 'open')`,
          [generateId('drf_'), shipment.id, shipment.user_id, shipment.quote_id || null, shipment.draftReason || 'pending', JSON.stringify(shipment.draftPayload || shipment)]
        );
      }

      if (shipment.label_url || shipment.label_base64) {
        await conn.query(
          `INSERT INTO shipment_labels (id, shipment_id, format, label_url, label_base64)
           VALUES (?, ?, ?, ?, ?)`,
          [generateId('lbl_'), shipment.id, shipment.label_format || 'pdf', shipment.label_url || null, shipment.label_base64 || null]
        );
      }

      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },

  async updateStatus(id: string, status: string, label: string): Promise<void> {
    await pool.query(
      'UPDATE shipments SET status = ?, status_label = ? WHERE id = ?',
      [status, label, id]
    );
  }
};

// 8. Eventos de Seguimiento (Tracking Events)
export const TrackingEventRepo = {
  async getByTrackingCode(trackingCode: string): Promise<any[]> {
    const [rows]: any = await pool.query(
      'SELECT * FROM tracking_events WHERE tracking_code = ? ORDER BY event_time DESC',
      [trackingCode]
    );
    return rows;
  },

  async getByShipmentId(shipmentId: string): Promise<any[]> {
    const [rows]: any = await pool.query(
      'SELECT * FROM tracking_events WHERE shipment_id = ? ORDER BY event_time DESC',
      [shipmentId]
    );
    return rows;
  },

  async create(event: any): Promise<void> {
    await pool.query(
      `INSERT INTO tracking_events (id, shipment_id, tracking_code, status_code, status_label, description, location, event_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        event.id || generateId('evt_'),
        event.shipment_id,
        event.tracking_code,
        event.status_code || null,
        event.status_label || event.status,
        event.description,
        event.location || null,
        event.event_time || new Date().toISOString().slice(0, 19).replace('T', ' ')
      ]
    );
  }
};

// 9. Tickets de Soporte (Tickets & Replies)
export const TicketRepo = {
  async getAll(): Promise<any[]> {
    const [rows]: any = await pool.query('SELECT * FROM tickets ORDER BY created_at DESC');
    // Fetch replies for each ticket
    for (const t of rows) {
      const [replies]: any = await pool.query('SELECT * FROM ticket_replies WHERE ticket_id = ? ORDER BY created_at ASC', [t.id]);
      t.replies = replies.map((r: any) => ({
        id: r.id,
        sender: r.sender_role === 'customer' ? 'user' : (r.sender_role === 'system' ? 'ai' : r.sender_role),
        senderName: r.sender_role === 'customer' ? 'Cliente' : (r.sender_role === 'system' ? 'Ship24go AI Assistant' : 'Admin'),
        message: r.message,
        createdAt: r.created_at
      }));
    }
    return rows;
  },

  async getByUserId(userId: string): Promise<any[]> {
    const [rows]: any = await pool.query('SELECT * FROM tickets WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    for (const t of rows) {
      const [replies]: any = await pool.query('SELECT * FROM ticket_replies WHERE ticket_id = ? ORDER BY created_at ASC', [t.id]);
      t.replies = replies.map((r: any) => ({
        id: r.id,
        sender: r.sender_role === 'customer' ? 'user' : (r.sender_role === 'system' ? 'ai' : r.sender_role),
        senderName: r.sender_role === 'customer' ? 'Cliente' : (r.sender_role === 'system' ? 'Ship24go AI Assistant' : 'Admin'),
        message: r.message,
        createdAt: r.created_at
      }));
    }
    return rows;
  },

  async getById(id: string): Promise<any | null> {
    const [rows]: any = await pool.query('SELECT * FROM tickets WHERE id = ?', [id]);
    const ticket = rows[0] || null;
    if (ticket) {
      const [replies]: any = await pool.query('SELECT * FROM ticket_replies WHERE ticket_id = ? ORDER BY created_at ASC', [id]);
      ticket.replies = replies.map((r: any) => ({
        id: r.id,
        sender: r.sender_role === 'customer' ? 'user' : (r.sender_role === 'system' ? 'ai' : r.sender_role),
        senderName: r.sender_role === 'customer' ? 'Cliente' : (r.sender_role === 'system' ? 'Ship24go AI Assistant' : 'Admin'),
        message: r.message,
        createdAt: r.created_at
      }));
    }
    return ticket;
  },

  async create(ticket: any): Promise<void> {
    await pool.query(
      'INSERT INTO tickets (id, user_id, subject, category, description, tracking_code, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [ticket.id, ticket.user_id, ticket.subject, ticket.category, ticket.description, ticket.tracking_code || '', ticket.status || 'open']
    );
  },

  async addReply(reply: any): Promise<void> {
    await pool.query(
      'INSERT INTO ticket_replies (id, ticket_id, sender_user_id, sender_role, message) VALUES (?, ?, ?, ?, ?)',
      [reply.id, reply.ticket_id, reply.sender_user_id || null, reply.sender_role, reply.message]
    );
  },

  async resolve(id: string): Promise<void> {
    await pool.query('UPDATE tickets SET status = "resolved" WHERE id = ?', [id]);
  }
};

export const RoleRepo = {
  async getAll(): Promise<any[]> {
    const [rows]: any = await pool.query('SELECT * FROM roles ORDER BY is_system DESC, name ASC');
    return rows.map((r: any) => ({
      ...r,
      permissions: typeof r.permissions === 'string' ? JSON.parse(r.permissions) : (r.permissions || [])
    }));
  },

  async getById(id: string): Promise<any | null> {
    const [rows]: any = await pool.query('SELECT * FROM roles WHERE id = ? OR slug = ?', [id, id]);
    if (!rows[0]) return null;
    const r = rows[0];
    return {
      ...r,
      permissions: typeof r.permissions === 'string' ? JSON.parse(r.permissions) : (r.permissions || [])
    };
  },

  async create(data: any): Promise<any> {
    const id = data.id || `role_${Date.now()}`;
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const permissions = JSON.stringify(data.permissions || []);
    await pool.query(
      'INSERT INTO roles (id, name, slug, description, permissions, is_system) VALUES (?, ?, ?, ?, ?, ?)',
      [id, data.name, slug, data.description || '', permissions, data.is_system ? 1 : 0]
    );
    return this.getById(id);
  },

  async update(id: string, data: any): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
    if (data.permissions !== undefined) {
      fields.push('permissions = ?');
      values.push(JSON.stringify(data.permissions));
    }
    if (fields.length > 0) {
      values.push(id);
      await pool.query(`UPDATE roles SET ${fields.join(', ')} WHERE id = ?`, values);
    }
    return this.getById(id);
  },

  async delete(id: string): Promise<boolean> {
    const role = await this.getById(id);
    if (!role || role.is_system) return false;
    await pool.query('DELETE FROM roles WHERE id = ?', [id]);
    return true;
  }
};

export const TeamRepo = {
  async getMembers(): Promise<any[]> {
    const [rows]: any = await pool.query(`
      SELECT 
        u.id, u.email, u.name, u.phone, u.role, u.role_id, u.custom_permissions, u.status, u.created_at, u.updated_at,
        r.name as role_name, r.slug as role_slug, r.permissions as role_permissions, r.description as role_description
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id OR u.role = r.slug
      WHERE u.role != 'customer' OR u.role_id IS NOT NULL
      ORDER BY u.created_at ASC
    `);
    return rows.map((u: any) => {
      let permissions: string[] = [];
      if (u.role === 'super_admin') {
        permissions = ['*'];
      } else {
        const rolePerms = typeof u.role_permissions === 'string' ? JSON.parse(u.role_permissions) : (u.role_permissions || []);
        const customPerms = typeof u.custom_permissions === 'string' ? JSON.parse(u.custom_permissions) : (u.custom_permissions || []);
        permissions = Array.from(new Set([...rolePerms, ...customPerms]));
      }
      return {
        id: u.id,
        email: u.email,
        name: u.name,
        phone: u.phone,
        role: u.role,
        role_id: u.role_id,
        role_name: u.role_name || (u.role === 'super_admin' ? 'Super Administrador' : (u.role === 'support' ? 'Soporte' : u.role)),
        status: u.status,
        permissions,
        created_at: u.created_at,
        updated_at: u.updated_at
      };
    });
  },

  async createMember(data: any): Promise<any> {
    const id = generateId('usr');
    const passwordHash = hashPassword(data.password || 'Ship24go2026!');
    const role = data.role || 'support';
    const roleId = data.role_id || null;
    const customPerms = data.custom_permissions ? JSON.stringify(data.custom_permissions) : null;

    await pool.query(
      `INSERT INTO users (id, email, password_hash, name, phone, country, currency, role, role_id, custom_permissions, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.email.toLowerCase().trim(),
        passwordHash,
        data.name.trim(),
        data.phone || '',
        data.country || 'ES',
        data.currency || 'EUR',
        role,
        roleId,
        customPerms,
        data.status || 'active'
      ]
    );

    const [rows]: any = await pool.query('SELECT id, email, name, phone, role, role_id, status, created_at FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  async updateMember(id: string, data: any): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.phone !== undefined) { fields.push('phone = ?'); values.push(data.phone); }
    if (data.role !== undefined) { fields.push('role = ?'); values.push(data.role); }
    if (data.role_id !== undefined) { fields.push('role_id = ?'); values.push(data.role_id); }
    if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status); }
    if (data.password) {
      fields.push('password_hash = ?');
      values.push(hashPassword(data.password));
    }
    if (data.custom_permissions !== undefined) {
      fields.push('custom_permissions = ?');
      values.push(data.custom_permissions ? JSON.stringify(data.custom_permissions) : null);
    }

    if (fields.length > 0) {
      values.push(id);
      await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    }

    const [rows]: any = await pool.query('SELECT id, email, name, phone, role, role_id, status, created_at FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  async deleteMember(id: string): Promise<boolean> {
    const [rows]: any = await pool.query('SELECT role FROM users WHERE id = ?', [id]);
    if (!rows[0] || rows[0].role === 'super_admin') return false;
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return true;
  },

  async getUserPermissions(userId: string): Promise<string[]> {
    const [rows]: any = await pool.query(`
      SELECT u.role, u.custom_permissions, r.permissions as role_permissions
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id OR u.role = r.slug
      WHERE u.id = ?
    `, [userId]);

    if (!rows[0]) return [];
    const u = rows[0];
    if (u.role === 'super_admin') return ['*'];

    const rolePerms = typeof u.role_permissions === 'string' ? JSON.parse(u.role_permissions) : (u.role_permissions || []);
    const customPerms = typeof u.custom_permissions === 'string' ? JSON.parse(u.custom_permissions) : (u.custom_permissions || []);
    return Array.from(new Set([...rolePerms, ...customPerms]));
  }
};

// 15. Points afiliados: ubicación verificada, aprobación y operaciones trazables
export const PointRepo = {
  async getByUserId(userId: string): Promise<any | null> {
    const [rows]: any = await pool.query('SELECT * FROM points WHERE user_id = ? LIMIT 1', [userId]);
    return rows[0] || null;
  },

  async getById(id: string): Promise<any | null> {
    const [rows]: any = await pool.query(
      `SELECT p.*, u.name AS user_name, u.email AS user_email, u.phone AS user_phone, u.status AS user_status
       FROM points p
       INNER JOIN users u ON u.id = p.user_id
       WHERE p.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async getAll(): Promise<any[]> {
    const [rows]: any = await pool.query(
      `SELECT p.*, u.name AS user_name, u.email AS user_email, u.phone AS user_phone, u.status AS user_status
       FROM points p
       INNER JOIN users u ON u.id = p.user_id
       ORDER BY FIELD(p.status, 'pending', 'approved', 'suspended', 'rejected'), p.created_at ASC`
    );
    return rows;
  },

  async getPublicApproved(filters?: { country?: string; city?: string; q?: string }): Promise<any[]> {
    let sql = `
      SELECT id, business_name, contact_name, phone, email, country, currency,
             address_line1, civic_number, city, province, postal_code, formatted_address,
             google_place_id, latitude, longitude, created_at
      FROM points
      WHERE status = 'approved'
    `;
    const params: any[] = [];
    if (filters?.country) {
      sql += ` AND country = ?`;
      params.push(filters.country.toUpperCase());
    }
    if (filters?.city) {
      sql += ` AND LOWER(city) LIKE ?`;
      params.push(`%${filters.city.toLowerCase()}%`);
    }
    if (filters?.q) {
      sql += ` AND (LOWER(business_name) LIKE ? OR LOWER(formatted_address) LIKE ? OR LOWER(city) LIKE ? OR postal_code LIKE ?)`;
      const term = `%${filters.q.toLowerCase()}%`;
      params.push(term, term, term, term);
    }
    sql += ` ORDER BY created_at DESC`;
    const [rows]: any = await pool.query(sql, params);
    return Array.isArray(rows)
      ? rows.map((r: any) => ({
          ...r,
          latitude: Number(r.latitude),
          longitude: Number(r.longitude)
        }))
      : [];
  },

  async create(point: any): Promise<void> {
    await pool.query(
      `INSERT INTO points (
        id, user_id, business_name, contact_name, email, phone, country, currency,
        address_line1, civic_number, city, province, postal_code, formatted_address,
        google_place_id, latitude, longitude, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        point.id,
        point.user_id,
        point.business_name,
        point.contact_name,
        point.email,
        point.phone || null,
        point.country || 'DO',
        point.currency || 'DOP',
        point.address_line1,
        point.civic_number || null,
        point.city,
        point.province || null,
        point.postal_code || null,
        point.formatted_address,
        point.google_place_id,
        point.latitude,
        point.longitude
      ]
    );
  },

  async updateStatus(id: string, status: string, reviewNote: string, reviewedBy: string): Promise<any | null> {
    await pool.query(
      `UPDATE points SET status = ?, review_note = ?, reviewed_by = ?, reviewed_at = NOW(), updated_at = NOW() WHERE id = ?`,
      [status, reviewNote || null, reviewedBy, id]
    );
    return this.getById(id);
  },

  async getProducts(includeInactive = false): Promise<any[]> {
    const [rows]: any = await pool.query(
      `SELECT id, code, name, description, base_price, commission_percent, currency, is_active, sort_order
       FROM point_products ${includeInactive ? '' : 'WHERE is_active = 1'} ORDER BY sort_order ASC, name ASC`
    );
    return rows.map((row: any) => ({
      ...row,
      base_price: Number(row.base_price || 0),
      commission_percent: Number(row.commission_percent || 0)
    }));
  },

  async updateProduct(id: string, data: any): Promise<any | null> {
    const basePrice = Number(data.base_price);
    const commissionPercent = Number(data.commission_percent);
    if (!Number.isFinite(basePrice) || basePrice < 0 || !Number.isFinite(commissionPercent) || commissionPercent < 0 || commissionPercent > 100) {
      return null;
    }
    await pool.query(
      `UPDATE point_products SET base_price = ?, commission_percent = ?, currency = ?, is_active = ?, updated_at = NOW() WHERE id = ?`,
      [Math.round(basePrice * 100) / 100, Math.round(commissionPercent * 1000) / 1000, String(data.currency || 'DOP').toUpperCase().slice(0, 3), data.is_active === false ? 0 : 1, id]
    );
    const products = await this.getProducts(true);
    return products.find((product: any) => product.id === id) || null;
  },

  async createOperation(operation: any): Promise<void> {
    await pool.query(
      `INSERT INTO point_operations (
        id, point_id, shipment_id, product_id, product_code, sale_amount,
        commission_amount, currency, status, receipt_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        operation.id,
        operation.point_id,
        operation.shipment_id,
        operation.product_id,
        operation.product_code,
        operation.sale_amount,
        operation.commission_amount,
        operation.currency || 'DOP',
        operation.status || 'received',
        operation.receipt_code
      ]
    );
  },

  async getOperationsByPointId(pointId: string): Promise<any[]> {
    const [rows]: any = await pool.query(
      `SELECT po.*, pp.name AS product_name, s.tracking_code, s.status_label,
              s.recipient_json, s.created_at AS shipment_created_at
       FROM point_operations po
       INNER JOIN point_products pp ON pp.id = po.product_id
       INNER JOIN shipments s ON s.id = po.shipment_id
       WHERE po.point_id = ?
       ORDER BY po.created_at DESC`,
      [pointId]
    );
    return rows;
  }
};
