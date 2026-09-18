-- Historial de tramos de un envío.
-- shipments.manifest_id sigue apuntando al tramo operativo actual; esta tabla
-- conserva todos los manifiestos por los que pasó el mismo tracking del cliente.
CREATE TABLE IF NOT EXISTS shipment_manifest_links (
  id CHAR(36) PRIMARY KEY,
  shipment_id CHAR(36) NOT NULL,
  manifest_id CHAR(36) NOT NULL,
  leg_number INT NOT NULL DEFAULT 1,
  attached_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  detached_at DATETIME NULL,
  UNIQUE KEY uq_shipment_manifest (shipment_id, manifest_id),
  INDEX idx_manifest_links_shipment_leg (shipment_id, leg_number),
  INDEX idx_manifest_links_manifest (manifest_id),
  CONSTRAINT fk_manifest_link_shipment
    FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE,
  CONSTRAINT fk_manifest_link_manifest
    FOREIGN KEY (manifest_id) REFERENCES point_manifests(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Compatibilidad: los envíos que ya tenían un manifiesto actual comienzan
-- con el tramo 1 sin cambiar su tracking ni su estado.
INSERT IGNORE INTO shipment_manifest_links (id, shipment_id, manifest_id, leg_number, attached_at)
SELECT UUID(), s.id, s.manifest_id, 1, COALESCE(s.created_at, NOW())
FROM shipments s
WHERE s.manifest_id IS NOT NULL;
