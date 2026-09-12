-- Ship24Go Point partner network
-- Traditional/community businesses can receive document shipments, consolidate them
-- into manifests, route them through hubs and earn commissions.

ALTER TABLE users
  MODIFY COLUMN role ENUM('customer','support','point_operator','super_admin') NOT NULL DEFAULT 'customer';

CREATE TABLE IF NOT EXISTS point_hubs (
  id CHAR(36) PRIMARY KEY,
  code VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  country CHAR(2) NOT NULL,
  city VARCHAR(120) NULL,
  address VARCHAR(255) NULL,
  postal_code VARCHAR(24) NULL,
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_point_hubs_country_status (country, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS partner_points (
  id CHAR(36) PRIMARY KEY,
  code VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  legal_name VARCHAR(191) NULL,
  country CHAR(2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'EUR',
  city VARCHAR(120) NULL,
  address VARCHAR(255) NULL,
  postal_code VARCHAR(24) NULL,
  phone VARCHAR(60) NULL,
  email VARCHAR(191) NULL,
  hub_id CHAR(36) NULL,
  status ENUM('pending','active','suspended','closed') NOT NULL DEFAULT 'active',
  decision_mode ENUM('rules','approval') NOT NULL DEFAULT 'rules',
  document_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  card_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  envelope_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  parcel_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  document_commission DECIMAL(12,2) NOT NULL DEFAULT 0,
  card_commission DECIMAL(12,2) NOT NULL DEFAULT 0,
  envelope_commission DECIMAL(12,2) NOT NULL DEFAULT 0,
  parcel_commission DECIMAL(12,2) NOT NULL DEFAULT 0,
  parcel_enabled TINYINT(1) NOT NULL DEFAULT 0,
  payout_method ENUM('bank','paypal','manual') NOT NULL DEFAULT 'manual',
  payout_approval_mode ENUM('manual','automatic') NOT NULL DEFAULT 'manual',
  payout_details_json JSON NULL,
  marketing_license_enabled TINYINT(1) NOT NULL DEFAULT 0,
  marketing_license_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_by CHAR(36) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_partner_points_hub FOREIGN KEY (hub_id) REFERENCES point_hubs(id) ON DELETE SET NULL,
  INDEX idx_partner_points_country_status (country, status),
  INDEX idx_partner_points_hub (hub_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS point_operators (
  point_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  operator_role ENUM('owner','manager','clerk') NOT NULL DEFAULT 'owner',
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (point_id, user_id),
  CONSTRAINT fk_point_operator_point FOREIGN KEY (point_id) REFERENCES partner_points(id) ON DELETE CASCADE,
  CONSTRAINT fk_point_operator_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_point_operator_user (user_id, active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS point_routing_rules (
  id CHAR(36) PRIMARY KEY,
  point_id CHAR(36) NULL,
  origin_country CHAR(2) NULL,
  destination_country CHAR(2) NOT NULL DEFAULT 'DO',
  item_type ENUM('document','card','envelope','parcel') NOT NULL,
  min_items INT NOT NULL DEFAULT 1,
  min_days INT NOT NULL DEFAULT 1,
  hub_id CHAR(36) NOT NULL,
  priority INT NOT NULL DEFAULT 100,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_point_rule_point FOREIGN KEY (point_id) REFERENCES partner_points(id) ON DELETE CASCADE,
  CONSTRAINT fk_point_rule_hub FOREIGN KEY (hub_id) REFERENCES point_hubs(id) ON DELETE RESTRICT,
  INDEX idx_point_rules_match (point_id, origin_country, destination_country, item_type, active, priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS point_manifests (
  id CHAR(36) PRIMARY KEY,
  point_id CHAR(36) NOT NULL,
  hub_id CHAR(36) NOT NULL,
  manifest_tracking VARCHAR(80) NOT NULL UNIQUE,
  item_type ENUM('document','card','envelope','parcel','mixed') NOT NULL DEFAULT 'mixed',
  item_count INT NOT NULL DEFAULT 0,
  status ENUM('open','ready','in_transit_to_hub','at_hub','exported','closed','cancelled') NOT NULL DEFAULT 'ready',
  origin_tracking VARCHAR(191) NULL,
  export_tracking VARCHAR(191) NULL,
  local_tracking VARCHAR(191) NULL,
  notes VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  dispatched_at DATETIME NULL,
  received_at DATETIME NULL,
  exported_at DATETIME NULL,
  closed_at DATETIME NULL,
  CONSTRAINT fk_point_manifest_point FOREIGN KEY (point_id) REFERENCES partner_points(id) ON DELETE RESTRICT,
  CONSTRAINT fk_point_manifest_hub FOREIGN KEY (hub_id) REFERENCES point_hubs(id) ON DELETE RESTRICT,
  INDEX idx_point_manifests_point_status (point_id, status),
  INDEX idx_point_manifests_hub_status (hub_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS point_items (
  id CHAR(36) PRIMARY KEY,
  point_id CHAR(36) NOT NULL,
  operator_user_id CHAR(36) NOT NULL,
  item_type ENUM('document','card','envelope','parcel') NOT NULL,
  customer_tracking VARCHAR(80) NOT NULL UNIQUE,
  receipt_number VARCHAR(80) NOT NULL UNIQUE,
  sender_json JSON NOT NULL,
  recipient_json JSON NOT NULL,
  description VARCHAR(255) NULL,
  declared_value DECIMAL(12,2) NOT NULL DEFAULT 0,
  service_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  commission_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency CHAR(3) NOT NULL DEFAULT 'EUR',
  destination_country CHAR(2) NOT NULL DEFAULT 'DO',
  hub_id CHAR(36) NULL,
  manifest_id CHAR(36) NULL,
  status ENUM('received','queued','consolidated','in_transit_to_hub','at_hub','exported','final_mile','delivered','exception','cancelled') NOT NULL DEFAULT 'received',
  status_label VARCHAR(120) NOT NULL DEFAULT 'Recibido en punto autorizado',
  local_tracking VARCHAR(191) NULL,
  final_shipment_id CHAR(36) NULL,
  final_shipment_tracking VARCHAR(191) NULL,
  delivered_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_point_item_point FOREIGN KEY (point_id) REFERENCES partner_points(id) ON DELETE RESTRICT,
  CONSTRAINT fk_point_item_operator FOREIGN KEY (operator_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_point_item_hub FOREIGN KEY (hub_id) REFERENCES point_hubs(id) ON DELETE SET NULL,
  CONSTRAINT fk_point_item_manifest FOREIGN KEY (manifest_id) REFERENCES point_manifests(id) ON DELETE SET NULL,
  INDEX idx_point_items_point_status (point_id, status, created_at),
  INDEX idx_point_items_manifest (manifest_id),
  INDEX idx_point_items_final_shipment (final_shipment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS point_tracking_events (
  id CHAR(36) PRIMARY KEY,
  item_id CHAR(36) NOT NULL,
  event_code VARCHAR(80) NOT NULL,
  status VARCHAR(80) NOT NULL,
  label VARCHAR(160) NOT NULL,
  location VARCHAR(191) NULL,
  event_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  metadata_json JSON NULL,
  CONSTRAINT fk_point_tracking_item FOREIGN KEY (item_id) REFERENCES point_items(id) ON DELETE CASCADE,
  INDEX idx_point_tracking_item_time (item_id, event_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS point_commissions (
  id CHAR(36) PRIMARY KEY,
  point_id CHAR(36) NOT NULL,
  item_id CHAR(36) NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency CHAR(3) NOT NULL DEFAULT 'EUR',
  status ENUM('earned','held','settled','cancelled') NOT NULL DEFAULT 'earned',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  settled_at DATETIME NULL,
  CONSTRAINT fk_point_commission_point FOREIGN KEY (point_id) REFERENCES partner_points(id) ON DELETE RESTRICT,
  CONSTRAINT fk_point_commission_item FOREIGN KEY (item_id) REFERENCES point_items(id) ON DELETE RESTRICT,
  UNIQUE KEY uq_point_commission_item (item_id),
  INDEX idx_point_commissions_point_status (point_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS point_payout_requests (
  id CHAR(36) PRIMARY KEY,
  point_id CHAR(36) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency CHAR(3) NOT NULL,
  method ENUM('bank','paypal','manual') NOT NULL,
  status ENUM('pending','approved','paid','rejected','cancelled') NOT NULL DEFAULT 'pending',
  payout_details_json JSON NULL,
  requested_by CHAR(36) NOT NULL,
  approved_by CHAR(36) NULL,
  note VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_at DATETIME NULL,
  paid_at DATETIME NULL,
  CONSTRAINT fk_point_payout_point FOREIGN KEY (point_id) REFERENCES partner_points(id) ON DELETE RESTRICT,
  INDEX idx_point_payout_status (status, created_at),
  INDEX idx_point_payout_point (point_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
