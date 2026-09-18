-- Esquema operativo reproducible para Point, Hub y última milla.
-- No crea usuarios, contraseñas, envíos ni paradas de demostración.

CREATE TABLE IF NOT EXISTS roles (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  description TEXT NULL,
  permissions JSON NOT NULL,
  is_system TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE users MODIFY COLUMN role
  ENUM('customer','support','super_admin','admin','operations','finance','custom','hub_operator','driver')
  NOT NULL DEFAULT 'customer';

SET @has_role_id := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role_id'
);
SET @sql_role_id := IF(@has_role_id = 0,
  'ALTER TABLE users ADD COLUMN role_id VARCHAR(36) NULL AFTER role',
  'SELECT 1');
PREPARE stmt_role_id FROM @sql_role_id;
EXECUTE stmt_role_id;
DEALLOCATE PREPARE stmt_role_id;

SET @has_custom_permissions := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'custom_permissions'
);
SET @sql_custom_permissions := IF(@has_custom_permissions = 0,
  'ALTER TABLE users ADD COLUMN custom_permissions JSON NULL AFTER role_id',
  'SELECT 1');
PREPARE stmt_custom_permissions FROM @sql_custom_permissions;
EXECUTE stmt_custom_permissions;
DEALLOCATE PREPARE stmt_custom_permissions;

SET @has_assigned_hub := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'assigned_hub_id'
);
SET @sql_assigned_hub := IF(@has_assigned_hub = 0,
  'ALTER TABLE users ADD COLUMN assigned_hub_id VARCHAR(36) NULL',
  'SELECT 1');
PREPARE stmt_assigned_hub FROM @sql_assigned_hub;
EXECUTE stmt_assigned_hub;
DEALLOCATE PREPARE stmt_assigned_hub;

SET @has_user_avatar := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'avatar_url'
);
SET @sql_user_avatar := IF(@has_user_avatar = 0,
  'ALTER TABLE users ADD COLUMN avatar_url MEDIUMTEXT NULL AFTER name',
  'SELECT 1');
PREPARE stmt_user_avatar FROM @sql_user_avatar;
EXECUTE stmt_user_avatar;
DEALLOCATE PREPARE stmt_user_avatar;

SET @has_point_executive := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'points' AND COLUMN_NAME = 'executive_user_id'
);
SET @sql_point_executive := IF(@has_point_executive = 0,
  'ALTER TABLE points ADD COLUMN executive_user_id VARCHAR(64) NULL AFTER user_id',
  'SELECT 1');
PREPARE stmt_point_executive FROM @sql_point_executive;
EXECUTE stmt_point_executive;
DEALLOCATE PREPARE stmt_point_executive;

INSERT INTO roles (id, name, slug, description, permissions, is_system)
VALUES
  ('role_hub', 'Operador de Hub Logístico', 'hub_operator',
   'Recepción, desconsolidación, inventario y asignación de rutas del Hub asignado.',
   '["hubs.view","hubs.inbound","hubs.deconsolidate","hubs.assign_route","manifests.view"]', 1),
  ('role_driver', 'Conductor / Última Milla', 'driver',
   'Ruta asignada y prueba de entrega.',
   '["driver.routes","driver.pod","driver.deliver"]', 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name), description = VALUES(description), permissions = VALUES(permissions);

CREATE TABLE IF NOT EXISTS point_employees (
  id CHAR(36) PRIMARY KEY,
  point_id CHAR(36) NOT NULL,
  name VARCHAR(191) NOT NULL,
  email VARCHAR(191) NOT NULL,
  phone VARCHAR(50) NULL,
  role ENUM('manager','cashier','operator') NOT NULL DEFAULT 'cashier',
  permissions JSON NOT NULL,
  status ENUM('active','suspended') NOT NULL DEFAULT 'active',
  pin_code VARCHAR(120) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_point_employees_point FOREIGN KEY (point_id) REFERENCES points(id) ON DELETE CASCADE,
  UNIQUE KEY uq_point_employee_email (point_id, email),
  INDEX idx_point_employees_status (point_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS point_devices (
  id CHAR(36) PRIMARY KEY,
  point_id CHAR(36) NOT NULL,
  device_name VARCHAR(191) NOT NULL,
  device_token VARCHAR(191) NOT NULL UNIQUE,
  owner_email VARCHAR(191) NOT NULL,
  latitude DECIMAL(10,7) NULL,
  longitude DECIMAL(10,7) NULL,
  distance_km DECIMAL(10,3) NULL,
  browser_info VARCHAR(500) NULL,
  status ENUM('active','revoked') NOT NULL DEFAULT 'active',
  last_used_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_point_devices_point FOREIGN KEY (point_id) REFERENCES points(id) ON DELETE CASCADE,
  INDEX idx_point_devices_point_status (point_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS point_bank_accounts (
  id CHAR(36) PRIMARY KEY,
  point_id CHAR(36) NOT NULL,
  bank_name VARCHAR(191) NOT NULL,
  account_holder VARCHAR(191) NOT NULL,
  account_number VARCHAR(191) NOT NULL,
  account_type VARCHAR(80) NOT NULL DEFAULT 'Ahorros',
  routing_number VARCHAR(120) NULL,
  document_id VARCHAR(120) NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  notes VARCHAR(500) NULL,
  is_default TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_point_bank_accounts_point FOREIGN KEY (point_id) REFERENCES points(id) ON DELETE CASCADE,
  INDEX idx_point_bank_accounts_point (point_id, is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS point_payout_requests (
  id CHAR(36) PRIMARY KEY,
  point_id CHAR(36) NOT NULL,
  point_bank_account_id CHAR(36) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  status ENUM('pending','approved','paid','rejected','cancelled') NOT NULL DEFAULT 'pending',
  bank_info_snapshot JSON NOT NULL,
  reference_number VARCHAR(120) NOT NULL UNIQUE,
  admin_note VARCHAR(500) NULL,
  requested_by CHAR(36) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_point_payout_point FOREIGN KEY (point_id) REFERENCES points(id) ON DELETE CASCADE,
  CONSTRAINT fk_point_payout_bank FOREIGN KEY (point_bank_account_id) REFERENCES point_bank_accounts(id) ON DELETE RESTRICT,
  INDEX idx_point_payout_point_status (point_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS point_cash_shifts (
  id CHAR(36) PRIMARY KEY,
  point_id CHAR(36) NOT NULL,
  employee_id CHAR(36) NULL,
  employee_name VARCHAR(191) NOT NULL,
  opening_cash_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  opening_notes VARCHAR(500) NULL,
  status ENUM('open','closed') NOT NULL DEFAULT 'open',
  opened_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  closed_at DATETIME NULL,
  closed_by_employee_id CHAR(36) NULL,
  closed_by_name VARCHAR(191) NULL,
  system_cash_expected DECIMAL(12,2) NULL,
  counted_cash_amount DECIMAL(12,2) NULL,
  difference_amount DECIMAL(12,2) NULL,
  closing_notes VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_point_cash_shifts_point FOREIGN KEY (point_id) REFERENCES points(id) ON DELETE CASCADE,
  INDEX idx_point_cash_shifts_point_status (point_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS point_chat_messages (
  id VARCHAR(64) PRIMARY KEY,
  point_id VARCHAR(64) NOT NULL,
  sender_user_id VARCHAR(64) NOT NULL,
  sender_role ENUM('point', 'executive', 'super_admin') NOT NULL,
  sender_name VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pcm_point_date (point_id, created_at),
  INDEX idx_pcm_sender (sender_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS driver_routes (
  id CHAR(36) PRIMARY KEY,
  route_code VARCHAR(50) NOT NULL UNIQUE,
  driver_id CHAR(36) NOT NULL,
  hub_id CHAR(36) NOT NULL,
  vehicle_plate VARCHAR(50) NULL,
  status ENUM('draft','assigned','in_progress','completed','cancelled') NOT NULL DEFAULT 'assigned',
  total_packages INT NOT NULL DEFAULT 0,
  completed_packages INT NOT NULL DEFAULT 0,
  started_at DATETIME NULL,
  completed_at DATETIME NULL,
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_driver_routes_driver_status (driver_id, status),
  INDEX idx_driver_routes_hub (hub_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS delivery_stops (
  id CHAR(36) PRIMARY KEY,
  route_id CHAR(36) NOT NULL,
  shipment_id CHAR(36) NOT NULL,
  tracking_code VARCHAR(100) NOT NULL,
  stop_number INT NOT NULL DEFAULT 1,
  recipient_name VARCHAR(191) NOT NULL,
  recipient_phone VARCHAR(50) NULL,
  recipient_address VARCHAR(255) NOT NULL,
  recipient_city VARCHAR(100) NOT NULL,
  status ENUM('pending','in_transit','delivered','failed','rescheduled') NOT NULL DEFAULT 'pending',
  failure_reason VARCHAR(255) NULL,
  pod_signer_name VARCHAR(191) NULL,
  pod_signer_id VARCHAR(100) NULL,
  pod_signature_image MEDIUMTEXT NULL,
  pod_photo_url MEDIUMTEXT NULL,
  pod_notes TEXT NULL,
  delivered_at DATETIME NULL,
  latitude DECIMAL(10,8) NULL,
  longitude DECIMAL(11,8) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_delivery_stops_route_order (route_id, stop_number),
  INDEX idx_delivery_stops_shipment (shipment_id),
  INDEX idx_delivery_stops_tracking (tracking_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Columnas operativas que consumen los paneles Hub/Point/Tracking.
-- Se agregan con metadata + prepared statements porque MySQL 8 no admite
-- ALTER TABLE ... ADD COLUMN IF NOT EXISTS.
SET @has_hub_latitude := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'hubs' AND COLUMN_NAME = 'latitude'
);
SET @sql_hub_latitude := IF(@has_hub_latitude = 0,
  'ALTER TABLE hubs ADD COLUMN latitude DECIMAL(10,7) NULL', 'SELECT 1');
PREPARE stmt_hub_latitude FROM @sql_hub_latitude;
EXECUTE stmt_hub_latitude;
DEALLOCATE PREPARE stmt_hub_latitude;

SET @has_hub_longitude := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'hubs' AND COLUMN_NAME = 'longitude'
);
SET @sql_hub_longitude := IF(@has_hub_longitude = 0,
  'ALTER TABLE hubs ADD COLUMN longitude DECIMAL(10,7) NULL', 'SELECT 1');
PREPARE stmt_hub_longitude FROM @sql_hub_longitude;
EXECUTE stmt_hub_longitude;
DEALLOCATE PREPARE stmt_hub_longitude;

SET @has_hub_timezone := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'hubs' AND COLUMN_NAME = 'timezone'
);
SET @sql_hub_timezone := IF(@has_hub_timezone = 0,
  'ALTER TABLE hubs ADD COLUMN timezone VARCHAR(50) NULL', 'SELECT 1');
PREPARE stmt_hub_timezone FROM @sql_hub_timezone;
EXECUTE stmt_hub_timezone;
DEALLOCATE PREPARE stmt_hub_timezone;

SET @has_hub_state := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'hubs' AND COLUMN_NAME = 'state_province'
);
SET @sql_hub_state := IF(@has_hub_state = 0,
  'ALTER TABLE hubs ADD COLUMN state_province VARCHAR(100) NULL', 'SELECT 1');
PREPARE stmt_hub_state FROM @sql_hub_state;
EXECUTE stmt_hub_state;
DEALLOCATE PREPARE stmt_hub_state;

SET @has_hub_email := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'hubs' AND COLUMN_NAME = 'email'
);
SET @sql_hub_email := IF(@has_hub_email = 0,
  'ALTER TABLE hubs ADD COLUMN email VARCHAR(191) NULL', 'SELECT 1');
PREPARE stmt_hub_email FROM @sql_hub_email;
EXECUTE stmt_hub_email;
DEALLOCATE PREPARE stmt_hub_email;

SET @has_hub_hours := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'hubs' AND COLUMN_NAME = 'operating_hours'
);
SET @sql_hub_hours := IF(@has_hub_hours = 0,
  'ALTER TABLE hubs ADD COLUMN operating_hours VARCHAR(100) NULL', 'SELECT 1');
PREPARE stmt_hub_hours FROM @sql_hub_hours;
EXECUTE stmt_hub_hours;
DEALLOCATE PREPARE stmt_hub_hours;

SET @has_hub_capacity := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'hubs' AND COLUMN_NAME = 'capacity_daily'
);
SET @sql_hub_capacity := IF(@has_hub_capacity = 0,
  'ALTER TABLE hubs ADD COLUMN capacity_daily INT NULL', 'SELECT 1');
PREPARE stmt_hub_capacity FROM @sql_hub_capacity;
EXECUTE stmt_hub_capacity;
DEALLOCATE PREPARE stmt_hub_capacity;

SET @has_hub_updated := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'hubs' AND COLUMN_NAME = 'updated_at'
);
SET @sql_hub_updated := IF(@has_hub_updated = 0,
  'ALTER TABLE hubs ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP', 'SELECT 1');
PREPARE stmt_hub_updated FROM @sql_hub_updated;
EXECUTE stmt_hub_updated;
DEALLOCATE PREPARE stmt_hub_updated;

-- The previous block deliberately keeps point_id under V24 ownership. Add
-- each remaining field individually through metadata checks.
SET @has_manifest_id := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'shipments' AND COLUMN_NAME = 'manifest_id'
);
SET @sql_manifest_id := IF(@has_manifest_id = 0, 'ALTER TABLE shipments ADD COLUMN manifest_id CHAR(36) NULL', 'SELECT 1');
PREPARE stmt_manifest_id FROM @sql_manifest_id;
EXECUTE stmt_manifest_id;
DEALLOCATE PREPARE stmt_manifest_id;

SET @has_hub_destination_id := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'shipments' AND COLUMN_NAME = 'hub_destination_id'
);
SET @sql_hub_destination_id := IF(@has_hub_destination_id = 0, 'ALTER TABLE shipments ADD COLUMN hub_destination_id CHAR(36) NULL', 'SELECT 1');
PREPARE stmt_hub_destination_id FROM @sql_hub_destination_id;
EXECUTE stmt_hub_destination_id;
DEALLOCATE PREPARE stmt_hub_destination_id;

SET @has_master_tracking := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'shipments' AND COLUMN_NAME = 'master_tracking_code'
);
SET @sql_master_tracking := IF(@has_master_tracking = 0, 'ALTER TABLE shipments ADD COLUMN master_tracking_code VARCHAR(100) NULL', 'SELECT 1');
PREPARE stmt_master_tracking FROM @sql_master_tracking;
EXECUTE stmt_master_tracking;
DEALLOCATE PREPARE stmt_master_tracking;

SET @has_point_walkin := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'shipments' AND COLUMN_NAME = 'is_point_walkin'
);
SET @sql_point_walkin := IF(@has_point_walkin = 0, 'ALTER TABLE shipments ADD COLUMN is_point_walkin TINYINT(1) NOT NULL DEFAULT 0', 'SELECT 1');
PREPARE stmt_point_walkin FROM @sql_point_walkin;
EXECUTE stmt_point_walkin;
DEALLOCATE PREPARE stmt_point_walkin;

SET @has_point_payment := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'shipments' AND COLUMN_NAME = 'point_payment_method'
);
SET @sql_point_payment := IF(@has_point_payment = 0, 'ALTER TABLE shipments ADD COLUMN point_payment_method VARCHAR(30) NULL', 'SELECT 1');
PREPARE stmt_point_payment FROM @sql_point_payment;
EXECUTE stmt_point_payment;
DEALLOCATE PREPARE stmt_point_payment;

SET @has_tracking_hub := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tracking_events' AND COLUMN_NAME = 'hub_id'
);
SET @sql_tracking_hub := IF(@has_tracking_hub = 0, 'ALTER TABLE tracking_events ADD COLUMN hub_id CHAR(36) NULL', 'SELECT 1');
PREPARE stmt_tracking_hub FROM @sql_tracking_hub;
EXECUTE stmt_tracking_hub;
DEALLOCATE PREPARE stmt_tracking_hub;

SET @has_tracking_latitude := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tracking_events' AND COLUMN_NAME = 'latitude'
);
SET @sql_tracking_latitude := IF(@has_tracking_latitude = 0, 'ALTER TABLE tracking_events ADD COLUMN latitude DECIMAL(10,7) NULL', 'SELECT 1');
PREPARE stmt_tracking_latitude FROM @sql_tracking_latitude;
EXECUTE stmt_tracking_latitude;
DEALLOCATE PREPARE stmt_tracking_latitude;

SET @has_tracking_longitude := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tracking_events' AND COLUMN_NAME = 'longitude'
);
SET @sql_tracking_longitude := IF(@has_tracking_longitude = 0, 'ALTER TABLE tracking_events ADD COLUMN longitude DECIMAL(10,7) NULL', 'SELECT 1');
PREPARE stmt_tracking_longitude FROM @sql_tracking_longitude;
EXECUTE stmt_tracking_longitude;
DEALLOCATE PREPARE stmt_tracking_longitude;

SET @has_tracking_country := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tracking_events' AND COLUMN_NAME = 'country_code'
);
SET @sql_tracking_country := IF(@has_tracking_country = 0, 'ALTER TABLE tracking_events ADD COLUMN country_code CHAR(2) NULL', 'SELECT 1');
PREPARE stmt_tracking_country FROM @sql_tracking_country;
EXECUTE stmt_tracking_country;
DEALLOCATE PREPARE stmt_tracking_country;

SET @has_tracking_city := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tracking_events' AND COLUMN_NAME = 'city'
);
SET @sql_tracking_city := IF(@has_tracking_city = 0, 'ALTER TABLE tracking_events ADD COLUMN city VARCHAR(100) NULL', 'SELECT 1');
PREPARE stmt_tracking_city FROM @sql_tracking_city;
EXECUTE stmt_tracking_city;
DEALLOCATE PREPARE stmt_tracking_city;

SET @has_manifest_warehouse_location := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'point_manifests' AND COLUMN_NAME = 'warehouse_location'
);
SET @sql_manifest_warehouse_location := IF(@has_manifest_warehouse_location = 0, 'ALTER TABLE point_manifests ADD COLUMN warehouse_location VARCHAR(255) NULL', 'SELECT 1');
PREPARE stmt_manifest_warehouse_location FROM @sql_manifest_warehouse_location;
EXECUTE stmt_manifest_warehouse_location;
DEALLOCATE PREPARE stmt_manifest_warehouse_location;

SET @has_manifest_warehouse_tracking := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'point_manifests' AND COLUMN_NAME = 'warehouse_tracking'
);
SET @sql_manifest_warehouse_tracking := IF(@has_manifest_warehouse_tracking = 0, 'ALTER TABLE point_manifests ADD COLUMN warehouse_tracking VARCHAR(80) NULL', 'SELECT 1');
PREPARE stmt_manifest_warehouse_tracking FROM @sql_manifest_warehouse_tracking;
EXECUTE stmt_manifest_warehouse_tracking;
DEALLOCATE PREPARE stmt_manifest_warehouse_tracking;

SET @has_manifest_total_weight := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'point_manifests' AND COLUMN_NAME = 'total_weight'
);
SET @sql_manifest_total_weight := IF(@has_manifest_total_weight = 0, 'ALTER TABLE point_manifests ADD COLUMN total_weight DECIMAL(10,3) NULL', 'SELECT 1');
PREPARE stmt_manifest_total_weight FROM @sql_manifest_total_weight;
EXECUTE stmt_manifest_total_weight;
DEALLOCATE PREPARE stmt_manifest_total_weight;

SET @has_manifest_quote_service := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'point_manifests' AND COLUMN_NAME = 'broker_quote_service'
);
SET @sql_manifest_quote_service := IF(@has_manifest_quote_service = 0, 'ALTER TABLE point_manifests ADD COLUMN broker_quote_service VARCHAR(191) NULL', 'SELECT 1');
PREPARE stmt_manifest_quote_service FROM @sql_manifest_quote_service;
EXECUTE stmt_manifest_quote_service;
DEALLOCATE PREPARE stmt_manifest_quote_service;

SET @has_manifest_quote_amount := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'point_manifests' AND COLUMN_NAME = 'broker_quote_amount'
);
SET @sql_manifest_quote_amount := IF(@has_manifest_quote_amount = 0, 'ALTER TABLE point_manifests ADD COLUMN broker_quote_amount DECIMAL(12,2) NULL', 'SELECT 1');
PREPARE stmt_manifest_quote_amount FROM @sql_manifest_quote_amount;
EXECUTE stmt_manifest_quote_amount;
DEALLOCATE PREPARE stmt_manifest_quote_amount;

SET @has_point_idempotency := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'point_operations' AND COLUMN_NAME = 'idempotency_key'
);
SET @sql_point_idempotency := IF(@has_point_idempotency = 0,
  'ALTER TABLE point_operations ADD COLUMN idempotency_key VARCHAR(120) NULL, ADD UNIQUE KEY uq_point_operations_idempotency (point_id, idempotency_key)',
  'SELECT 1');
PREPARE stmt_point_idempotency FROM @sql_point_idempotency;
EXECUTE stmt_point_idempotency;
DEALLOCATE PREPARE stmt_point_idempotency;

SET @has_point_idempotency_index := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'point_operations'
    AND INDEX_NAME = 'uq_point_operations_idempotency'
);
SET @sql_point_idempotency_index := IF(@has_point_idempotency_index = 0,
  'ALTER TABLE point_operations ADD UNIQUE KEY uq_point_operations_idempotency (point_id, idempotency_key)',
  'SELECT 1');
PREPARE stmt_point_idempotency_index FROM @sql_point_idempotency_index;
EXECUTE stmt_point_idempotency_index;
DEALLOCATE PREPARE stmt_point_idempotency_index;

INSERT IGNORE INTO app_versions (version, name, description)
VALUES ('V1.5.1', 'Point Hub Driver runtime', 'Esquema reproducible y seguro para operación Point, Hubs y última milla sin seeds de usuarios ni datos demo.');
