-- V27__point_terminal_manifests_tariffs.sql
-- Tablas para Sacas/Manifiestos de consolidacion, Hubs de cruce, Tarifas Propias y Arqueo de Caja de Points

-- 1. HUBS (Centros Logisticos y Puntos de Cruce / Bodegas)
CREATE TABLE IF NOT EXISTS hubs (
  id CHAR(36) PRIMARY KEY,
  code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  hub_type ENUM('origin', 'transit', 'destination') NOT NULL DEFAULT 'transit',
  country CHAR(2) NOT NULL DEFAULT 'US',
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(30) NOT NULL,
  address VARCHAR(255) NOT NULL,
  manager_name VARCHAR(120) NULL,
  phone VARCHAR(50) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_hubs_country_code (country, code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Productos que utiliza el POS de Point. Deben existir antes de insertar
-- point_operations porque point_operations.product_id tiene FK estricta.
INSERT IGNORE INTO point_products
  (id, code, name, description, base_price, commission_percent, currency, is_active, sort_order)
VALUES
  ('pp_legal_document', 'legal_document', 'Documento legal', 'Documentos legales y notariales', 0.00, 15.000, 'USD', 1, 12),
  ('pp_box_s', 'box_s', 'Caja pequeña', 'Paquete Box S', 0.00, 15.000, 'USD', 1, 22),
  ('pp_box_m', 'box_m', 'Caja mediana', 'Paquete Box M', 0.00, 15.000, 'USD', 1, 23),
  ('pp_box_l', 'box_l', 'Caja grande', 'Paquete Box L', 0.00, 15.000, 'USD', 1, 24),
  ('pp_heavy_parcel', 'heavy_parcel', 'Paquete pesado', 'Paquete de mayor peso', 0.00, 15.000, 'USD', 1, 25);

-- 2. TARIFAS PROPIAS INTERNACIONALES SHIP24GO
CREATE TABLE IF NOT EXISTS international_tariffs (
  id CHAR(36) PRIMARY KEY,
  route_name VARCHAR(120) NOT NULL,
  origin_country CHAR(2) NOT NULL DEFAULT 'US',
  origin_hub_id CHAR(36) NULL,
  dest_country CHAR(2) NOT NULL DEFAULT 'DO',
  dest_hub_id CHAR(36) NULL,
  product_type ENUM('document', 'envelope', 'box_s', 'box_m', 'box_l', 'legal_document', 'heavy_parcel') NOT NULL,
  product_name VARCHAR(120) NOT NULL,
  description VARCHAR(255) NULL,
  base_price DECIMAL(10,2) NOT NULL,
  point_commission DECIMAL(10,2) NOT NULL,
  hub_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  max_weight_kg DECIMAL(8,2) NOT NULL DEFAULT 1.00,
  extra_kg_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  transit_days_min INT NOT NULL DEFAULT 3,
  transit_days_max INT NOT NULL DEFAULT 7,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tariffs_route_product (origin_country, dest_country, product_type, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. SACAS / MANIFIESTOS DE CONSOLIDACION
CREATE TABLE IF NOT EXISTS point_manifests (
  id CHAR(36) PRIMARY KEY,
  manifest_number VARCHAR(50) NOT NULL UNIQUE,
  point_id CHAR(36) NOT NULL,
  origin_hub_id CHAR(36) NULL,
  destination_hub_id CHAR(36) NULL,
  category ENUM('documents', 'parcels', 'mixed') NOT NULL DEFAULT 'documents',
  total_items INT NOT NULL DEFAULT 0,
  min_items_threshold INT NOT NULL DEFAULT 10,
  status ENUM('open', 'closed', 'in_transit_hub', 'received_hub', 'dispatched_intl', 'arrived_dest', 'completed') NOT NULL DEFAULT 'open',
  master_tracking_code VARCHAR(100) NULL,
  provider_code VARCHAR(50) NULL,
  courier_name VARCHAR(80) NULL,
  notes VARCHAR(500) NULL,
  closed_at DATETIME NULL,
  dispatched_at DATETIME NULL,
  received_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_manifest_point FOREIGN KEY (point_id) REFERENCES points(id) ON DELETE CASCADE,
  INDEX idx_manifest_point_status (point_id, status),
  INDEX idx_manifest_number (manifest_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. MOVIMIENTOS DE CAJA DEL POINT (ARQUEO EN EFECTIVO)
CREATE TABLE IF NOT EXISTS point_cash_register (
  id CHAR(36) PRIMARY KEY,
  point_id CHAR(36) NOT NULL,
  operation_id CHAR(36) NULL,
  shipment_id CHAR(36) NULL,
  movement_type ENUM('sale_cash', 'sale_card', 'payout_commission', 'cash_drop', 'adjustment') NOT NULL DEFAULT 'sale_cash',
  amount DECIMAL(12,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  notes VARCHAR(255) NULL,
  created_by CHAR(36) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cash_point FOREIGN KEY (point_id) REFERENCES points(id) ON DELETE CASCADE,
  INDEX idx_cash_point_created (point_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tarifas base Ship24Go (los Hubs reales se asignan desde el panel Admin)
INSERT IGNORE INTO international_tariffs 
  (id, route_name, origin_country, origin_hub_id, dest_country, dest_hub_id, product_type, product_name, description, base_price, point_commission, hub_cost, max_weight_kg, extra_kg_price, currency, transit_days_min, transit_days_max, is_active, sort_order)
VALUES
  ('trf_us_do_doc', 'USA -> Republica Dominicana', 'US', NULL, 'DO', NULL, 'document', 'Sobre / Documento Estandar', 'Documentos, cartas, partidas de nacimiento y papeles (hasta 0.5 kg). Agrupable en Saca.', 8.00, 1.50, 2.00, 0.50, 4.00, 'USD', 3, 5, 1, 1),
  ('trf_us_do_legal', 'USA -> Republica Dominicana', 'US', NULL, 'DO', NULL, 'legal_document', 'Documento Legal / Notarial Urgente', 'Poderes notariales, contratos, titulos con custodia prioritaria y sobre sellado.', 15.00, 3.00, 3.50, 1.00, 6.00, 'USD', 2, 4, 1, 2),
  ('trf_us_do_box_s', 'USA -> Republica Dominicana', 'US', NULL, 'DO', NULL, 'box_s', 'Caja Pequena (Box S - hasta 2 kg)', 'Cajas compactas de medicinas, cosmeticos, ropa o repuestos ligeros.', 18.00, 3.00, 5.00, 2.00, 5.00, 'USD', 4, 7, 1, 3),
  ('trf_us_do_box_m', 'USA -> Republica Dominicana', 'US', NULL, 'DO', NULL, 'box_m', 'Caja Mediana (Box M - hasta 5 kg)', 'Cajas medianas para familiares y comercio minorista.', 32.00, 5.00, 8.00, 5.00, 5.00, 'USD', 4, 7, 1, 4),
  ('trf_us_do_box_l', 'USA -> Republica Dominicana', 'US', NULL, 'DO', NULL, 'box_l', 'Caja Grande (Box L - hasta 10 kg)', 'Cajas grandes para envios de volumen familiar.', 55.00, 8.00, 12.00, 10.00, 4.50, 'USD', 5, 8, 1, 5);
