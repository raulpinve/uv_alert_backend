// scripts/test-manual.js

/**
 * Script de prueba manual para el cron de monitoreo de UV.
 *
 * Corre runUvMonitorJob() fuera del schedule, útil para probar
 * la detección de cambio de rango y el envío de notificaciones
 * (incluida la línea de tiempo de exposición) sin esperar al cron real.
 *
 * Uso:
 *   node scripts/test-manual.js
 *   node scripts/test-manual.js --force-change
 *   node scripts/test-manual.js --force-change --device=12
 *   node scripts/test-manual.js --force-change --range=HIGH
 *
 * Opciones:
 *   --force-change   Fuerza el rango guardado para provocar una notificación.
 *   --range=CODE     Código del rango de partida (por defecto: NONE).
 *   --device=ID      Limita el forzado a un solo dispositivo.
 */

import "dotenv/config";

import { pool } from "../init.db.js";
import { runUvMonitorJob } from "../jobs/uvMonitor.cron.js";

if (process.env.NODE_ENV === "production") {
  console.error("Este script no debe correrse en producción. Abortando.");
  process.exit(1);
}

function getArg(name) {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.slice(name.length + 3) : null;
}

async function forceRangeChange(rangeCode, deviceId) {
  const { rows: ranges } = await pool.query(
    "SELECT id FROM uv_ranges WHERE code = $1 LIMIT 1",
    [rangeCode]
  );

  if (ranges.length === 0) {
    throw new Error(`No existe el rango '${rangeCode}' en uv_ranges.`);
  }

  const { rowCount } = await pool.query(
    `
    UPDATE devices
    SET uv_range_id = $1
    WHERE fcm_token IS NOT NULL
      AND ($2::text IS NULL OR id::text = $2::text)
    `,
    [ranges[0].id, deviceId]
  );

  console.log(`Rango forzado a ${rangeCode} en ${rowCount} device(s).`);

  if (rowCount === 0) {
    console.warn("Ningún device coincidió con el filtro. No habrá notificación.");
    return;
  }

  // Sin tipo de piel, la notificación sale sin la línea de exposición.
  const { rows: withoutSkin } = await pool.query(
    `
    SELECT d.id
    FROM devices d
    JOIN users u ON u.id = d.user_id
    LEFT JOIN skin_types st ON st.id = u.skin_type_id
    WHERE d.fcm_token IS NOT NULL
      AND ($1::text IS NULL OR d.id::text = $1::text)
      AND st.med_j_m2 IS NULL
    `,
    [deviceId]
  );

  if (withoutSkin.length > 0) {
    console.warn(
      `Sin tipo de piel (no llevarán tiempo de exposición): ${withoutSkin
        .map((r) => r.id)
        .join(", ")}`
    );
  }
}

async function main() {
  const forceChange = process.argv.includes("--force-change");
  const rangeCode = getArg("range") ?? "NONE";
  const deviceId = getArg("device");

  if (forceChange) {
    await forceRangeChange(rangeCode, deviceId);
  }

  await runUvMonitorJob();
}

main()
  .then(async () => {
    console.log("Ejecución manual terminada.");
    await pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("Falló:", err);
    await pool.end().catch(() => {});
    process.exit(1);
  });