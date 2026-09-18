#!/usr/bin/env node

// Compatibilidad para el comando histórico. La migración real está versionada
// y no contiene usuarios, contraseñas, envíos ni paradas de demostración.
process.env.MIGRATION_FILE = process.env.MIGRATION_FILE || 'migrations/V28__point_hub_driver_runtime.sql';

const { execFileSync } = require('node:child_process');

try {
  execFileSync(process.execPath, ['--import', 'tsx/esm', 'migrations/run_migration.ts'], {
    stdio: 'inherit',
    env: process.env
  });
} catch (error) {
  process.exit(typeof error.status === 'number' ? error.status : 1);
}
