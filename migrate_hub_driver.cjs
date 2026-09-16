const mysql = require('mysql2/promise');
const crypto = require('crypto');

function hashPassword(password) {
  const salt = 'ship24go_salt_98765';
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function generateId(prefix = '') {
  const pfx = String(prefix || '');
  const maxRandomHexLen = Math.max(2, 36 - pfx.length);
  const bytesNeeded = Math.max(1, Math.floor(maxRandomHexLen / 2));
  return `${pfx}${crypto.randomBytes(bytesNeeded).toString('hex')}`.slice(0, 36);
}

async function run() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'ship24go',
    password: 'epJzDBnxxCDmx3cC',
    database: 'ship24go'
  });

  console.log('--- 1. Migrando esquema de roles y columnas en users ---');
  try {
    await connection.query(`
      ALTER TABLE users MODIFY COLUMN role 
      ENUM('customer','support','super_admin','admin','operations','finance','custom','hub_operator','driver') 
      NOT NULL DEFAULT 'customer'
    `);
    console.log('✓ ENUM de roles actualizado en users');
  } catch (e) {
    console.log('Note role enum:', e.message);
  }

  try {
    const [cols] = await connection.query(`SHOW COLUMNS FROM users LIKE 'assigned_hub_id'`);
    if (!cols.length) {
      await connection.query(`ALTER TABLE users ADD COLUMN assigned_hub_id VARCHAR(36) NULL AFTER role_id`);
      console.log('✓ Columna assigned_hub_id añadida a users');
    }
  } catch (e) {
    console.log('Note assigned_hub_id:', e.message);
  }

  console.log('--- 2. Creando tablas de rutas y paradas de choferes ---');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS driver_routes (
      id CHAR(36) PRIMARY KEY,
      route_code VARCHAR(50) NOT NULL UNIQUE,
      driver_id CHAR(36) NOT NULL,
      hub_id CHAR(36) NOT NULL,
      vehicle_plate VARCHAR(50) NULL,
      status ENUM('draft', 'assigned', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'assigned',
      total_packages INT NOT NULL DEFAULT 0,
      completed_packages INT NOT NULL DEFAULT 0,
      started_at DATETIME NULL,
      completed_at DATETIME NULL,
      notes TEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_driver_status (driver_id, status),
      INDEX idx_hub (hub_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('✓ Tabla driver_routes lista');

  await connection.query(`
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
      status ENUM('pending', 'in_transit', 'delivered', 'failed', 'rescheduled') NOT NULL DEFAULT 'pending',
      failure_reason VARCHAR(255) NULL,
      pod_signer_name VARCHAR(191) NULL,
      pod_signer_id VARCHAR(100) NULL,
      pod_signature_image MEDIUMTEXT NULL,
      pod_photo_url MEDIUMTEXT NULL,
      pod_notes TEXT NULL,
      delivered_at DATETIME NULL,
      latitude DECIMAL(10, 8) NULL,
      longitude DECIMAL(11, 8) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_route_stop (route_id, stop_number),
      INDEX idx_shipment (shipment_id),
      INDEX idx_tracking (tracking_code)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('✓ Tabla delivery_stops lista');

  console.log('--- 3. Creando roles en tabla roles ---');
  await connection.query(`
    INSERT INTO roles (id, name, slug, description, permissions, is_system)
    VALUES 
      ('role_hub', 'Operador de Hub Logístico', 'hub_operator', 
       'Gestión de recepción de sacas, desconsolidación de manifiestos e inventario de almacén.',
       '["hubs.view", "hubs.inbound", "hubs.deconsolidate", "hubs.assign_route", "manifests.view"]', 1),
      ('role_driver', 'Conductor / Última Milla', 'driver', 
       'Hoja de ruta diaria, navegación de entregas y registro de prueba de entrega (POD).',
       '["driver.routes", "driver.pod", "driver.deliver"]', 1)
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      description = VALUES(description),
      permissions = VALUES(permissions)
  `);
  console.log('✓ Roles role_hub y role_driver configurados');

  console.log('--- 4. Creando / Actualizando Usuarios de Prueba ---');
  // 1. Super Admin: admin@ship24go.com
  const adminPassHash = hashPassword('Admin2026!*');
  await connection.query(`
    INSERT INTO users (id, email, password_hash, name, role, status, country, currency)
    VALUES ('usr_admin_global_01', 'admin@ship24go.com', ?, 'Super Administrador Global', 'super_admin', 'active', 'US', 'USD')
    ON DUPLICATE KEY UPDATE
      password_hash = VALUES(password_hash),
      role = 'super_admin',
      status = 'active'
  `, [adminPassHash]);
  console.log('✓ Super Admin admin@ship24go.com configurado');

  // 2. Hub Miami: hub.miami@ship24go.com
  const hubMiamiPassHash = hashPassword('HubMiami2026!*');
  const hubMiamiId = generateId('usr_hub_');
  await connection.query(`
    INSERT INTO users (id, email, password_hash, name, role, role_id, assigned_hub_id, phone, status, country, currency)
    VALUES (?, 'hub.miami@ship24go.com', ?, 'Carlos Mendoza (Hub Miami Manager)', 'hub_operator', 'role_hub', 'hub_mia_01', '+1 (305) 555-0199', 'active', 'US', 'USD')
    ON DUPLICATE KEY UPDATE
      password_hash = VALUES(password_hash),
      name = VALUES(name),
      role = 'hub_operator',
      role_id = 'role_hub',
      assigned_hub_id = 'hub_mia_01',
      status = 'active'
  `, [hubMiamiId, hubMiamiPassHash]);
  console.log('✓ Hub Miami hub.miami@ship24go.com configurado');

  // 3. Driver RD: driver.rd@ship24go.com
  const driverRdPassHash = hashPassword('DriverRD2026!*');
  const driverRdId = 'usr_drv_rd_001';
  await connection.query(`
    INSERT INTO users (id, email, password_hash, name, role, role_id, assigned_hub_id, phone, status, country, currency)
    VALUES (?, 'driver.rd@ship24go.com', ?, 'Kelvin Rosario (Chofer Última Milla Santo Domingo)', 'driver', 'role_driver', 'hub_sdq_01', '+1 (809) 555-8899', 'active', 'DO', 'DOP')
    ON DUPLICATE KEY UPDATE
      password_hash = VALUES(password_hash),
      name = VALUES(name),
      role = 'driver',
      role_id = 'role_driver',
      assigned_hub_id = 'hub_sdq_01',
      phone = '+1 (809) 555-8899',
      status = 'active'
  `, [driverRdId, driverRdPassHash]);
  console.log('✓ Driver RD driver.rd@ship24go.com configurado');

  console.log('--- 5. Sembrando ruta de prueba activa para Driver RD ---');
  const routeId = 'route_sdq_today_01';
  const routeCode = 'RUT-SDQ-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-01';

  await connection.query(`
    INSERT INTO driver_routes (id, route_code, driver_id, hub_id, vehicle_plate, status, total_packages, completed_packages, started_at, notes)
    VALUES (?, ?, ?, 'hub_sdq_01', 'L-394821 (Furgoneta Blanca)', 'in_progress', 3, 0, NOW(), 'Ruta Centro y Polígono Central - Santo Domingo D.N.')
    ON DUPLICATE KEY UPDATE
      vehicle_plate = VALUES(vehicle_plate),
      status = 'in_progress',
      notes = VALUES(notes)
  `, [routeId, routeCode, driverRdId]);

  // Asegurar 3 envíos de prueba asociados a la ruta
  const sampleStops = [
    {
      id: 'stop_01',
      shipmentId: 'shp_sample_rd_01',
      tracking: 'S24-849102-3912',
      stopNum: 1,
      name: 'Lic. Roberto Almonte',
      phone: '+1 809-555-1234',
      address: 'Av. Winston Churchill #1099, Torre Acrópolis, Piso 12',
      city: 'Piantini, Santo Domingo D.N.'
    },
    {
      id: 'stop_02',
      shipmentId: 'shp_sample_rd_02',
      tracking: 'S24-739103-9182',
      stopNum: 2,
      name: 'María Fernández',
      phone: '+1 829-555-5678',
      address: 'Calle Agustín Lara #22, Res. Las Palmeras Apto 4B',
      city: 'Naco, Santo Domingo D.N.'
    },
    {
      id: 'stop_03',
      shipmentId: 'shp_sample_rd_03',
      tracking: 'S24-629104-1847',
      stopNum: 3,
      name: 'Dr. Manuel Peña (Clínica Abreu)',
      phone: '+1 809-555-9012',
      address: 'Calle Beller #42, Consultorio 203',
      city: 'Gazcue, Santo Domingo D.N.'
    }
  ];

  for (const s of sampleStops) {
    // Insertar shipment ficticio si no existe
    await connection.query(`
      INSERT INTO shipments (
        id, tracking_code, user_id, provider_id, status, status_label,
        type, category, origin_country, destination_country,
        total_price, base_price, currency, dest_hub_id
      ) VALUES (
        ?, ?, 'usr_admin_global_01', 'prv_ship24go', 'in_route', 'En Ruta de Reparto Local',
        'express', 'document', 'US', 'DO',
        38.00, 38.00, 'USD', 'hub_sdq_01'
      ) ON DUPLICATE KEY UPDATE status = 'in_route', status_label = 'En Ruta de Reparto Local'
    `, [s.shipmentId, s.tracking]);

    await connection.query(`
      INSERT INTO delivery_stops (
        id, route_id, shipment_id, tracking_code, stop_number,
        recipient_name, recipient_phone, recipient_address, recipient_city, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      ON DUPLICATE KEY UPDATE
        recipient_name = VALUES(recipient_name),
        recipient_phone = VALUES(recipient_phone),
        recipient_address = VALUES(recipient_address),
        recipient_city = VALUES(recipient_city),
        status = 'pending'
    `, [s.id, routeId, s.shipmentId, s.tracking, s.stopNum, s.name, s.phone, s.address, s.city]);
  }
  console.log('✓ 3 paradas de entrega sembradas en Santo Domingo');

  await connection.end();
  console.log('=== MIGRACIÓN Y SEMILLAS COMPLETADAS EXITOSAMENTE ===');
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
