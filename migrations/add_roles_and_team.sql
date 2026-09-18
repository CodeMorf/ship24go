-- Las credenciales se gestionan fuera de las migraciones mediante el entorno.
-- Esta migración solo prepara roles y permisos; no cambia contraseñas.

-- 1. Crear tabla de roles
CREATE TABLE IF NOT EXISTS roles (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  permissions JSON NOT NULL,
  is_system TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Modificar users para admitir roles extendidos y columnas
ALTER TABLE users MODIFY COLUMN role ENUM('customer','support','super_admin','admin','operations','finance','custom') NOT NULL DEFAULT 'customer';

-- Agregar role_id si no existe
SET @exist_role_id = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='ship24go' AND TABLE_NAME='users' AND COLUMN_NAME='role_id');
SET @sql_role_id = IF(@exist_role_id = 0, 'ALTER TABLE users ADD COLUMN role_id VARCHAR(36) NULL AFTER role', 'SELECT 1');
PREPARE stmt FROM @sql_role_id;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar custom_permissions si no existe
SET @exist_perms = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='ship24go' AND TABLE_NAME='users' AND COLUMN_NAME='custom_permissions');
SET @sql_perms = IF(@exist_perms = 0, 'ALTER TABLE users ADD COLUMN custom_permissions JSON NULL AFTER role_id', 'SELECT 1');
PREPARE stmt FROM @sql_perms;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Sembrar roles por defecto
INSERT INTO roles (id, name, slug, description, permissions, is_system)
VALUES 
(
  'role_super_admin',
  'Super Administrador',
  'super_admin',
  'Acceso total a todos los módulos y configuraciones maestras del sistema.',
  '[\ dashboard.view\,\clients.view\,\clients.manage\,\shipments.view\,\shipments.manage\,\providers.view\,\providers.manage\,\integrations.manage\,\payments.manage\,\plans.manage\,\banks.manage\,\reports.view\,\settings.manage\,\tickets.view\,\tickets.reply\,\copilot.use\,\team.view\,\team.manage\,\roles.view\,\roles.manage\]',
  1
),
(
  'role_admin',
  'Administrador',
  'admin',
  'Gestión general de clientes, envíos, reportes, tickets y equipo, sin alteración de configuraciones maestras de servidor.',
  '[\dashboard.view\,\clients.view\,\clients.manage\,\shipments.view\,\shipments.manage\,\providers.view\,\plans.manage\,\banks.manage\,\reports.view\,\tickets.view\,\tickets.reply\,\copilot.use\,\team.view\,\team.manage\]',
  1
),
(
  'role_support',
  'Soporte al Cliente',
  'support',
  'Atención de tickets de ayuda, consulta de estado de envíos y clientes.',
  '[\dashboard.view\,\clients.view\,\shipments.view\,\tickets.view\,\tickets.reply\,\copilot.use\]',
  1
),
(
  'role_operations',
  'Operaciones & Logística',
  'operations',
  'Gestión y seguimiento operativo de envíos, etiquetas y proveedores.',
  '[\dashboard.view\,\shipments.view\,\shipments.manage\,\providers.view\,\reports.view\]',
  1
),
(
  'role_finance',
  'Finanzas & Pagos',
  'finance',
  'Control financiero, planes, recargas de saldo, transacciones y bancos.',
  '[\dashboard.view\,\clients.view\,\payments.manage\,\plans.manage\,\banks.manage\,\reports.view\]',
  1
)
ON DUPLICATE KEY UPDATE 
  permissions = VALUES(permissions),
  description = VALUES(description);

-- 4. Vincular Super Admin actual al rol role_super_admin
UPDATE users SET role_id = 'role_super_admin' WHERE role = 'super_admin' AND (role_id IS NULL OR role_id = '');
