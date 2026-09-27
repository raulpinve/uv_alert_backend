// scripts/test-manual.js
//
// ⚠️ Script de prueba manual para el cron de monitoreo de UV.
// Corre runUvMonitorJob() fuera del schedule, útil para probar
// la lógica de detección de cambio de rango y el envío de
// notificaciones sin esperar al cron real.
//
// Uso:
//   node scripts/test-manual.js
//   node scripts/test-manual.js --force-change   (fuerza un cambio de rango
//                                                  antes de correr, para que
//                                                  se dispare una notificación)

import "dotenv/config";
import { pool } from "../init.db.js";
import { runUvMonitorJob } from "../jobs/uvMonitor.job.js"; // ajusta el path si es distinto

if (process.env.NODE_ENV === "production") {
  console.error("Este script no debe correrse en producción. Abortando.");
  process.exit(1);
}

async function forceRangeChange() {
  const { rowCount } = await pool.query(`
    UPDATE devices
    SET uv_range_id = (SELECT id FROM uv_ranges WHERE code = 'NONE' LIMIT 1)
    WHERE fcm_token IS NOT NULL
  `);
  console.log(
    `Rango forzado a NONE en ${rowCount} device(s) para provocar notificación en este run.`
  );
}

async function main() {
  if (process.argv.includes("--force-change")) {
    await forceRangeChange();
  }

  await runUvMonitorJob();
}

main()
  .then(() => {
    console.log("Ejecución manual terminada.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Falló:", err);
    process.exit(1);
  });