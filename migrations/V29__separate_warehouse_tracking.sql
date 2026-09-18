-- Corrige una contaminación histórica: el tracking de almacén WH-XXXXXX
-- se había guardado en shipments.master_tracking_code. El tracking de
-- almacén vive en point_manifests.warehouse_tracking; el master pertenece
-- únicamente al manifiesto oficial.
UPDATE shipments s
INNER JOIN point_manifests m ON m.id = s.manifest_id
SET s.master_tracking_code = NULL
WHERE s.master_tracking_code LIKE 'WH-%'
  AND m.warehouse_tracking IS NOT NULL
  AND s.master_tracking_code = CONCAT('WH-', m.warehouse_tracking)
  AND (m.master_tracking_code IS NULL OR m.master_tracking_code NOT LIKE 'WH-%');

INSERT IGNORE INTO app_versions (version, name, description)
VALUES (
  'V1.5.2',
  'Separate warehouse and master tracking',
  'Limpia valores WH-* mal guardados como master y conserva cada tracking en su nivel correcto.'
);
