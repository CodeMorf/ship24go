import mysql from 'mysql2/promise';

async function run() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'ship24go',
    password: 'epJzDBnxxCDmx3cC',
    database: 'ship24go',
    multipleStatements: true
  });

  console.log('Connected to MySQL');

  // 1. Update password
  await connection.query(
    'UPDATE users SET password_hash = ? WHERE email = ?',
    ['bcf97f66a9cda1d28ca227c23338a336486a6b1f2a5d0787b331c05d4584b619284a727c4ca652b34340252e952a0f679b72b0411f2a3967c3c90ec4373083e5', 'admin@ship24go.com']
  );
  console.log('Admin password updated to Gaia1234');

  // 2. Create roles table
  await connection.query(`
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
  `);
  console.log('Roles table created/verified');

  // 3. Modify users role enum
  await connection.query(`
    ALTER TABLE users MODIFY COLUMN role ENUM('customer','support','super_admin','admin','operations','finance','custom') NOT NULL DEFAULT 'customer';
  `);

  // 4. Add role_id and custom_permissions if not exist
  const [cols] = await connection.query(`
    SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='ship24go' AND TABLE_NAME='users';
  `);
  const colNames = (cols as any[]).map(c => c.COLUMN_NAME);

  if (!colNames.includes('role_id')) {
    await connection.query('ALTER TABLE users ADD COLUMN role_id VARCHAR(36) NULL AFTER role;');
    console.log('Added role_id to users');
  }

  if (!colNames.includes('custom_permissions')) {
    await connection.query('ALTER TABLE users ADD COLUMN custom_permissions JSON NULL AFTER role_id;');
    console.log('Added custom_permissions to users');
  }

  // 5. Seed standard roles
  const standardRoles = [
    {
      id: 'role_super_admin',
      name: 'Super Administrador',
      slug: 'super_admin',
      description: 'Acceso total sin restricciones a todos los módulos y configuraciones.',
      permissions: [
        'dashboard.view',
        'clients.view', 'clients.manage',
        'shipments.view', 'shipments.manage',
        'providers.view', 'providers.manage',
        'integrations.manage',
        'payments.manage',
        'plans.manage',
        'banks.manage',
        'reports.view',
        'settings.manage',
        'tickets.view', 'tickets.reply',
        'copilot.use',
        'team.view', 'team.manage',
        'roles.view', 'roles.manage'
      ],
      is_system: 1
    },
    {
      id: 'role_admin',
      name: 'Administrador',
      slug: 'admin',
      description: 'Gestión completa de clientes, envíos, reportes, tickets y equipo.',
      permissions: [
        'dashboard.view',
        'clients.view', 'clients.manage',
        'shipments.view', 'shipments.manage',
        'providers.view',
        'plans.manage',
        'banks.manage',
        'reports.view',
        'tickets.view', 'tickets.reply',
        'copilot.use',
        'team.view', 'team.manage'
      ],
      is_system: 1
    },
    {
      id: 'role_support',
      name: 'Soporte al Cliente',
      slug: 'support',
      description: 'Atención y resolución de tickets, consulta de envíos y clientes.',
      permissions: [
        'dashboard.view',
        'clients.view',
        'shipments.view',
        'tickets.view', 'tickets.reply',
        'copilot.use'
      ],
      is_system: 1
    },
    {
      id: 'role_operations',
      name: 'Operaciones & Logística',
      slug: 'operations',
      description: 'Gestión operativa de envíos, etiquetas y seguimiento de transportistas.',
      permissions: [
        'dashboard.view',
        'shipments.view', 'shipments.manage',
        'providers.view',
        'reports.view'
      ],
      is_system: 1
    },
    {
      id: 'role_finance',
      name: 'Finanzas & Facturación',
      slug: 'finance',
      description: 'Control de pagos, planes, pasarelas, bancos y movimientos de wallet.',
      permissions: [
        'dashboard.view',
        'clients.view',
        'payments.manage',
        'plans.manage',
        'banks.manage',
        'reports.view'
      ],
      is_system: 1
    }
  ];

  for (const r of standardRoles) {
    await connection.query(
      `INSERT INTO roles (id, name, slug, description, permissions, is_system) 
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         name = VALUES(name),
         description = VALUES(description),
         permissions = VALUES(permissions);`,
      [r.id, r.name, r.slug, r.description, JSON.stringify(r.permissions), r.is_system]
    );
  }
  console.log('Standard roles seeded OK');

  // 6. Link admin@ship24go.com to role_super_admin
  await connection.query(`
    UPDATE users SET role = 'super_admin', role_id = 'role_super_admin' WHERE email = 'admin@ship24go.com';
  `);
  console.log('Linked admin user to role_super_admin');

  await connection.end();
  console.log('Migration complete successfully!');
}

run().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
