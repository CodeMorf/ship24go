// Migration: Add GPS coordinates to hubs + hub_id/lat/lng to tracking_events
const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
  const required = ['MYSQL_HOST', 'MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_DATABASE'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length) throw new Error(`Faltan variables MySQL: ${missing.join(', ')}`);

  const pool = await mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true, connectionLimit: 3
  });

  console.log('═══════════════════════════════════════════════════════');
  console.log('  MIGRACIÓN: GPS + Ubicación Completa para Hubs');
  console.log('═══════════════════════════════════════════════════════\n');

  // ──── 1. ALTER hubs: add latitude, longitude, timezone, state_province, email ────
  console.log('── 1. ALTER TABLE hubs ──');

  const hubColumns = [
    { name: 'latitude', sql: "ALTER TABLE hubs ADD COLUMN latitude DECIMAL(10,7) NULL AFTER address" },
    { name: 'longitude', sql: "ALTER TABLE hubs ADD COLUMN longitude DECIMAL(10,7) NULL AFTER latitude" },
    { name: 'timezone', sql: "ALTER TABLE hubs ADD COLUMN timezone VARCHAR(50) NULL DEFAULT 'America/New_York' AFTER longitude" },
    { name: 'state_province', sql: "ALTER TABLE hubs ADD COLUMN state_province VARCHAR(100) NULL AFTER city" },
    { name: 'email', sql: "ALTER TABLE hubs ADD COLUMN email VARCHAR(191) NULL AFTER phone" },
    { name: 'operating_hours', sql: "ALTER TABLE hubs ADD COLUMN operating_hours VARCHAR(100) NULL DEFAULT 'Lun-Vie 8:00-18:00' AFTER email" },
    { name: 'capacity_daily', sql: "ALTER TABLE hubs ADD COLUMN capacity_daily INT NULL DEFAULT 500 AFTER operating_hours COMMENT 'Max paquetes por día'" },
    { name: 'updated_at', sql: "ALTER TABLE hubs ADD COLUMN updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP AFTER created_at" }
  ];

  for (const col of hubColumns) {
    try {
      await pool.query(col.sql);
      console.log(`   ✅ Added column: ${col.name}`);
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log(`   ⏭️  Column already exists: ${col.name}`);
      } else {
        console.log(`   ❌ Error adding ${col.name}: ${e.message}`);
      }
    }
  }

  // ──── 2. ALTER tracking_events: add hub_id, latitude, longitude, country_code ────
  console.log('\n── 2. ALTER TABLE tracking_events ──');

  const teColumns = [
    { name: 'hub_id', sql: "ALTER TABLE tracking_events ADD COLUMN hub_id CHAR(36) NULL AFTER shipment_id" },
    { name: 'latitude', sql: "ALTER TABLE tracking_events ADD COLUMN latitude DECIMAL(10,7) NULL AFTER location" },
    { name: 'longitude', sql: "ALTER TABLE tracking_events ADD COLUMN longitude DECIMAL(10,7) NULL AFTER latitude" },
    { name: 'country_code', sql: "ALTER TABLE tracking_events ADD COLUMN country_code CHAR(2) NULL AFTER longitude" },
    { name: 'city', sql: "ALTER TABLE tracking_events ADD COLUMN city VARCHAR(100) NULL AFTER country_code" },
  ];

  for (const col of teColumns) {
    try {
      await pool.query(col.sql);
      console.log(`   ✅ Added column: ${col.name}`);
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log(`   ⏭️  Column already exists: ${col.name}`);
      } else {
        console.log(`   ❌ Error adding ${col.name}: ${e.message}`);
      }
    }
  }

  // Add index on hub_id in tracking_events
  try {
    await pool.query("ALTER TABLE tracking_events ADD INDEX idx_te_hub (hub_id)");
    console.log('   ✅ Added index idx_te_hub');
  } catch (e) {
    if (e.code === 'ER_DUP_KEYNAME') {
      console.log('   ⏭️  Index idx_te_hub already exists');
    } else {
      console.log(`   ❌ Index error: ${e.message}`);
    }
  }

  // ──── 3. POPULATE hubs with real GPS coordinates ────
  console.log('\n── 3. POPULATE hubs with GPS coordinates ──');

  const hubGPS = [
    {
      id: 'hub_bos_01',
      latitude: 42.3601,
      longitude: -71.0589,
      timezone: 'America/New_York',
      state_province: 'Massachusetts',
      email: 'hub.boston@ship24go.com',
      operating_hours: 'Mon-Fri 7:00-19:00'
    },
    {
      id: 'hub_mia_01',
      latitude: 25.8124,
      longitude: -80.3397,
      timezone: 'America/New_York',
      state_province: 'Florida',
      email: 'hub.miami@ship24go.com',
      operating_hours: 'Mon-Sat 6:00-22:00'
    },
    {
      id: 'hub_sdq_01',
      latitude: 18.4861,
      longitude: -69.9312,
      timezone: 'America/Santo_Domingo',
      state_province: 'Distrito Nacional',
      email: 'hub.santodomingo@ship24go.com',
      operating_hours: 'Lun-Sáb 7:00-20:00'
    }
  ];

  for (const hub of hubGPS) {
    await pool.query(
      `UPDATE hubs SET 
         latitude = ?, longitude = ?, timezone = ?, 
         state_province = ?, email = ?, operating_hours = ?
       WHERE id = ?`,
      [hub.latitude, hub.longitude, hub.timezone, hub.state_province, hub.email, hub.operating_hours, hub.id]
    );
    console.log(`   ✅ ${hub.id} → (${hub.latitude}, ${hub.longitude}) — ${hub.state_province}, ${hub.timezone}`);
  }

  // ──── 4. BACKFILL tracking_events with hub location data ────
  console.log('\n── 4. BACKFILL tracking_events with hub location ──');

  // Update events that mention hub reception
  const [atHubEvents] = await pool.query(
    `SELECT te.id, te.status_code, te.location, te.description,
            s.hub_destination_id, s.manifest_id
     FROM tracking_events te
     INNER JOIN shipments s ON s.id = te.shipment_id
     WHERE te.hub_id IS NULL
       AND (te.status_code LIKE '%hub%' OR te.status_code LIKE '%transit%' OR te.status_code = 'at_hub')
     LIMIT 100`
  );

  let backfilled = 0;
  for (const ev of atHubEvents) {
    // Try to determine the hub from the manifest or destination
    let hubId = null;
    if (ev.status_code === 'at_hub' && ev.hub_destination_id) {
      hubId = ev.hub_destination_id;
    }
    // Get the manifest's destination hub
    if (!hubId && ev.manifest_id) {
      const [mRows] = await pool.query(
        'SELECT destination_hub_id FROM point_manifests WHERE id = ? LIMIT 1',
        [ev.manifest_id]
      );
      if (mRows[0]?.destination_hub_id) hubId = mRows[0].destination_hub_id;
    }

    if (hubId) {
      const hub = hubGPS.find(h => h.id === hubId);
      if (hub) {
        await pool.query(
          `UPDATE tracking_events 
           SET hub_id = ?, latitude = ?, longitude = ?, country_code = ?, city = ?
           WHERE id = ?`,
          [hubId, hub.latitude, hub.longitude, 
           hubId === 'hub_sdq_01' ? 'DO' : 'US',
           hubId === 'hub_bos_01' ? 'Boston' : hubId === 'hub_mia_01' ? 'Doral' : 'Santo Domingo',
           ev.id]
        );
        backfilled++;
      }
    }
  }
  console.log(`   ✅ Backfilled ${backfilled}/${atHubEvents.length} tracking events with hub GPS`);

  // ──── 5. VERIFY FINAL STATE ────
  console.log('\n── 5. VERIFY FINAL STATE ──');

  const [hubs] = await pool.query('SELECT id, code, city, state_province, country, latitude, longitude, timezone FROM hubs');
  console.log('\n   Hubs con coordenadas:');
  for (const h of hubs) {
    console.log(`   🏢 ${h.code} — ${h.city}, ${h.state_province}, ${h.country} → (${h.latitude}, ${h.longitude}) TZ: ${h.timezone}`);
  }

  const [evSample] = await pool.query(
    `SELECT te.id, te.status_code, te.location, te.hub_id, te.latitude, te.longitude, te.country_code, te.city
     FROM tracking_events te 
     WHERE te.hub_id IS NOT NULL 
     LIMIT 5`
  );
  console.log('\n   Tracking events con ubicación:');
  for (const e of evSample) {
    console.log(`   📍 ${e.status_code} → hub=${e.hub_id}, (${e.latitude}, ${e.longitude}), ${e.city}, ${e.country_code}`);
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  ✅ MIGRACIÓN COMPLETADA');
  console.log('═══════════════════════════════════════════════════════');

  await pool.end();
}

main().catch(err => { console.error('FATAL:', err); process.exit(1); });
