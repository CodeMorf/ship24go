-- Ship24Go V1.4.38 - Point afiliado: onboarding, productos y operaciones
-- Idempotente: se ejecuta también desde initDb para instalaciones existentes.

CREATE TABLE IF NOT EXISTS points (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL UNIQUE,
  business_name VARCHAR(191) NOT NULL,
  contact_name VARCHAR(191) NOT NULL,
  email VARCHAR(191) NOT NULL,
  phone VARCHAR(50) NULL,
  country CHAR(2) NOT NULL DEFAULT 'DO',
  currency CHAR(3) NOT NULL DEFAULT 'DOP',
  address_line1 VARCHAR(255) NOT NULL,
  civic_number VARCHAR(30) NULL,
  city VARCHAR(120) NOT NULL,
  province VARCHAR(120) NULL,
  postal_code VARCHAR(30) NULL,
  formatted_address VARCHAR(255) NOT NULL,
  google_place_id VARCHAR(191) NOT NULL,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  status ENUM('pending','approved','suspended','rejected') NOT NULL DEFAULT 'pending',
  review_note VARCHAR(500) NULL,
  reviewed_by CHAR(36) NULL,
  reviewed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_points_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_points_status_created (status, created_at),
  INDEX idx_points_country_city (country, city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS point_products (
  id CHAR(36) PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  description VARCHAR(255) NULL,
  base_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  commission_percent DECIMAL(8,3) NOT NULL DEFAULT 0.000,
  currency CHAR(3) NOT NULL DEFAULT 'DOP',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_point_products_active (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS point_operations (
  id CHAR(36) PRIMARY KEY,
  point_id CHAR(36) NOT NULL,
  shipment_id CHAR(36) NOT NULL UNIQUE,
  product_id CHAR(36) NOT NULL,
  product_code VARCHAR(50) NOT NULL,
  sale_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  commission_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  currency CHAR(3) NOT NULL DEFAULT 'DOP',
  status ENUM('received','at_hub','in_route','delivered','cancelled') NOT NULL DEFAULT 'received',
  receipt_code VARCHAR(191) NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_point_operations_point FOREIGN KEY (point_id) REFERENCES points(id) ON DELETE RESTRICT,
  CONSTRAINT fk_point_operations_shipment FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE,
  CONSTRAINT fk_point_operations_product FOREIGN KEY (product_id) REFERENCES point_products(id) ON DELETE RESTRICT,
  INDEX idx_point_operations_point_created (point_id, created_at),
  INDEX idx_point_operations_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE shipments ADD COLUMN IF NOT EXISTS point_id CHAR(36) NULL;

INSERT IGNORE INTO point_products (id, code, name, description, base_price, commission_percent, currency, is_active, sort_order)
VALUES
  ('pp_document', 'document', 'Documento', 'Documentos y papeles', 0.00, 0.000, 'DOP', 1, 10),
  ('pp_envelope', 'envelope', 'Sobre', 'Sobres y correspondencia', 0.00, 0.000, 'DOP', 1, 20),
  ('pp_card', 'card', 'Tarjeta', 'Tarjetas y documentos compactos', 0.00, 0.000, 'DOP', 1, 30);

INSERT IGNORE INTO app_versions (version, name, description)
VALUES ('V1.4.38', 'Point afiliado MVP', 'Registro de Points con ubicación Google Maps, aprobación administrativa, emisión trazable y tracking público compartido.');
