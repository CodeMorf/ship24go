-- Hardening del POS Point: tokens de dispositivo, autorización de terminal,
-- trazabilidad de empleado/turno y compatibilidad completa de caja.

SET @device_hash_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'point_devices' AND COLUMN_NAME = 'device_token_hash'
);
SET @device_hash_sql := IF(
  @device_hash_exists = 0,
  'ALTER TABLE point_devices ADD COLUMN device_token_hash CHAR(64) NULL AFTER device_token',
  'SELECT 1'
);
PREPARE stmt_device_hash FROM @device_hash_sql;
EXECUTE stmt_device_hash;
DEALLOCATE PREPARE stmt_device_hash;

SET @device_token_nullable_sql := 'ALTER TABLE point_devices MODIFY COLUMN device_token VARCHAR(191) NULL';
PREPARE stmt_device_token_nullable FROM @device_token_nullable_sql;
EXECUTE stmt_device_token_nullable;
DEALLOCATE PREPARE stmt_device_token_nullable;

-- Migra tokens históricos a SHA-256 y elimina el secreto en claro de la base.
UPDATE point_devices
SET device_token_hash = SHA2(device_token, 256), device_token = NULL
WHERE device_token IS NOT NULL AND (device_token_hash IS NULL OR device_token_hash = '');

SET @device_hash_index_exists := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'point_devices' AND INDEX_NAME = 'uq_point_devices_token_hash'
);
SET @device_hash_index_sql := IF(
  @device_hash_index_exists = 0,
  'ALTER TABLE point_devices ADD UNIQUE KEY uq_point_devices_token_hash (device_token_hash)',
  'SELECT 1'
);
PREPARE stmt_device_hash_index FROM @device_hash_index_sql;
EXECUTE stmt_device_hash_index;
DEALLOCATE PREPARE stmt_device_hash_index;

SET @cash_enum_sql := 'ALTER TABLE point_cash_register MODIFY COLUMN movement_type ENUM(\'sale_cash\',\'sale_card\',\'payout_commission\',\'cash_drop\',\'adjustment\',\'cash_opening\',\'cash_closing\') NOT NULL DEFAULT \'sale_cash\'';
PREPARE stmt_cash_enum FROM @cash_enum_sql;
EXECUTE stmt_cash_enum;
DEALLOCATE PREPARE stmt_cash_enum;

SET @cash_shift_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'point_cash_register' AND COLUMN_NAME = 'shift_id'
);
SET @cash_shift_sql := IF(@cash_shift_exists = 0,
  'ALTER TABLE point_cash_register ADD COLUMN shift_id CHAR(36) NULL AFTER shipment_id, ADD COLUMN employee_id CHAR(36) NULL AFTER shift_id, ADD COLUMN device_id CHAR(36) NULL AFTER employee_id, ADD COLUMN payment_method VARCHAR(30) NULL AFTER currency',
  'SELECT 1');
PREPARE stmt_cash_shift FROM @cash_shift_sql;
EXECUTE stmt_cash_shift;
DEALLOCATE PREPARE stmt_cash_shift;

SET @op_employee_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'point_operations' AND COLUMN_NAME = 'employee_id'
);
SET @op_employee_sql := IF(@op_employee_exists = 0,
  'ALTER TABLE point_operations ADD COLUMN employee_id CHAR(36) NULL AFTER shipment_id, ADD COLUMN shift_id CHAR(36) NULL AFTER employee_id, ADD COLUMN device_id CHAR(36) NULL AFTER shift_id',
  'SELECT 1');
PREPARE stmt_op_employee FROM @op_employee_sql;
EXECUTE stmt_op_employee;
DEALLOCATE PREPARE stmt_op_employee;

SET @cash_shift_index_exists := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'point_cash_register' AND INDEX_NAME = 'idx_cash_shift'
);
SET @cash_shift_index_sql := IF(@cash_shift_index_exists = 0,
  'ALTER TABLE point_cash_register ADD INDEX idx_cash_shift (shift_id, created_at), ADD INDEX idx_cash_employee (employee_id, created_at)',
  'SELECT 1');
PREPARE stmt_cash_shift_index FROM @cash_shift_index_sql;
EXECUTE stmt_cash_shift_index;
DEALLOCATE PREPARE stmt_cash_shift_index;

SET @op_audit_index_exists := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'point_operations' AND INDEX_NAME = 'idx_point_operations_shift'
);
SET @op_audit_index_sql := IF(@op_audit_index_exists = 0,
  'ALTER TABLE point_operations ADD INDEX idx_point_operations_shift (shift_id, created_at), ADD INDEX idx_point_operations_employee (employee_id, created_at)',
  'SELECT 1');
PREPARE stmt_op_audit_index FROM @op_audit_index_sql;
EXECUTE stmt_op_audit_index;
DEALLOCATE PREPARE stmt_op_audit_index;
