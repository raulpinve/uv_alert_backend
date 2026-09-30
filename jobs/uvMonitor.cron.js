import cron from "node-cron";
import { messaging } from "../config/firebase.js";
import { pool } from "../init.db.js";
import { getUv } from "../repositories/uv.repository.js";
import {
  getUvRange,
  getRecommendationMessage,
  getNotificationTitle,
} from "../utils/uvRange.utils.js";
import {
  getRecommendedExposureMinutes,
  formatExposureTime,
  MAX_RECOMMENDED_MINUTES,
} from "../utils/exposureTime.utils.js";

const INVALID_TOKEN_CODES = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
]);

/**
 * Devuelve la frase de exposición lista para concatenar al body,
 * o "" si no hay datos suficientes (sin tipo de piel o UV = 0).
 */
function buildExposureLine(minutes) {
  if (minutes === null) return "";

  if (minutes >= MAX_RECOMMENDED_MINUTES) {
    return " Tardarías +4 h en enrojecerte.";
  }

  return ` Sin protección, te enrojecerías en ~${formatExposureTime(minutes)}.`;
}

/**
 * @returns {Promise<"sent" | "invalid_token" | "failed">}
 */
async function sendNotification(fcmToken, newRange, uvValue, medJm2) {
  const notificationTitle = getNotificationTitle(newRange.code, newRange.name);
  const tipMessage = getRecommendationMessage(newRange.code);

  const minutes = getRecommendedExposureMinutes(uvValue, medJm2);
  const exposureLine = buildExposureLine(minutes);

  const message = {
    token: fcmToken,
    notification: {
      title: notificationTitle,
      body: `Está en ${uvValue}. ${tipMessage}${exposureLine}`,
    },
    android: {
      notification: {
        icon: "ic_stat_zenit", // nombre del drawable, sin extensión
        color: "#2F8BE6",
      },
    },
    data: {
      current_uv: String(uvValue),
      uv_range_id: String(newRange.id),
      ...(minutes !== null && { exposure_minutes: String(minutes) }),
    },
  };

  try {
    await messaging.send(message);
    console.log(`Notification sent to token ${fcmToken.slice(0, 10)}...`);
    return "sent";
  } catch (error) {
    console.error(`Error sending notification: ${error.message}`);

    if (INVALID_TOKEN_CODES.has(error.code)) {
      await pool.query("DELETE FROM devices WHERE fcm_token = $1", [fcmToken]);
      return "invalid_token";
    }
    return "failed";
  }
}

async function processDevice(device) {
  const {
    id,
    latitude,
    longitude,
    fcm_token,
    uv_range_id: previousRangeId,
    med_j_m2,
  } = device;

  try {
    const uvInfo = await getUv(latitude, longitude);
    const uvValue = uvInfo.current.uv;

    const newRange = await getUvRange(uvValue);
    if (!newRange) {
      console.warn(`No range found for UV=${uvValue} (device ${id})`);
      return;
    }

    const isFirstRun = previousRangeId == null;
    const rangeChanged = !isFirstRun && previousRangeId !== newRange.id;

    // Por defecto se guarda el nuevo rango; si el envío falla, se conserva
    // el anterior para reintentar en el siguiente ciclo.
    let rangeIdToSave = newRange.id;

    if (rangeChanged) {
      const status = await sendNotification(
        fcm_token,
        newRange,
        uvValue,
        med_j_m2
      );

      if (status === "invalid_token") return; // dispositivo ya eliminado
      if (status === "failed") rangeIdToSave = previousRangeId;
    }

    await pool.query(
      `
      UPDATE devices
      SET current_uv = $1,
          uv_range_id = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      `,
      [uvValue, rangeIdToSave, id]
    );

    if (isFirstRun) {
      console.log(
        `Device ${id} initialized with range ${newRange.code} (no notification).`
      );
    }
  } catch (error) {
    console.error(`Error processing device ${id}: ${error.message}`);
  }
}

let isRunning = false;

async function runUvMonitorJob() {
  if (isRunning) {
    console.warn("Previous run still in progress, skipping this tick.");
    return;
  }
  isRunning = true;

  console.log("Starting UV monitoring cron job...");

  try {
    const { rows: devices } = await pool.query(`
      SELECT d.id,
             d.latitude,
             d.longitude,
             d.fcm_token,
             d.uv_range_id,
             st.med_j_m2
      FROM devices d
      JOIN users u ON u.id = d.user_id
      LEFT JOIN skin_types st ON st.id = u.skin_type_id
    `);

    console.log(`Processing ${devices.length} device(s)...`);

    for (const device of devices) {
      await processDevice(device);
    }

    console.log("Cron job finished.");
  } catch (error) {
    console.error(`General error in cron job: ${error.message}`);
  } finally {
    isRunning = false;
  }
}

cron.schedule("0 */15 6-19 * * *", runUvMonitorJob, {
  timezone: "America/Bogota",
});

export { runUvMonitorJob, sendNotification };