import fs from 'node:fs';
import path from 'node:path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Ejecuta una migración explícitamente seleccionada mediante MIGRATION_FILE.
 * Las credenciales siempre provienen del entorno; este script no crea
 * usuarios, no cambia contraseñas y no inserta datos de demostración.
 */
async function run() {
  const migrationFile = process.env.MIGRATION_FILE;
  if (!migrationFile) {
    throw new Error('Indica MIGRATION_FILE con la ruta de una migración antes de ejecutarla.');
  }

  const migrationPath = path.resolve(process.cwd(), migrationFile);
  const workspaceRoot = path.resolve(process.cwd());
  if (!migrationPath.startsWith(`${workspaceRoot}${path.sep}`)) {
    throw new Error('La migración debe estar dentro del proyecto.');
  }
  if (!fs.existsSync(migrationPath)) {
    throw new Error(`No existe la migración indicada: ${migrationFile}`);
  }

  const required = ['MYSQL_HOST', 'MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_DATABASE'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length) {
    throw new Error(`Faltan variables de conexión MySQL: ${missing.join(', ')}`);
  }

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    multipleStatements: true
  });

  try {
    await connection.beginTransaction();
    await connection.query(fs.readFileSync(migrationPath, 'utf8'));
    await connection.commit();
    console.log(`Migración aplicada: ${migrationFile}`);
  } catch (error) {
    await connection.rollback().catch(() => {});
    throw error;
  } finally {
    await connection.end();
  }
}

run().catch(error => {
  console.error('Error de migración:', error instanceof Error ? error.message : error);
  process.exit(1);
});
