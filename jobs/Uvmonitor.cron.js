import cron from "node-cron";
import { messaging } from "../config/firebase.js";
import { pool } from "../init.db.js";
import { getUv } from "../repositories/uv.repository.js";
import {
  getUvRange,
  getRecommendationMessage,
  getNotificationTitle,
} from "../utils/uvRange.utils.js";

async function sendNotification(fcmToken, newRange, uvValue) {
  const notificationTitle = getNotificationTitle(newRange.code, newRange.name);
  const tipMessage = getRecommendationMessage(newRange.code);

  const message = {
    token: fcmToken,

    notification: {
      title: notificationTitle,
      body: `Está en ${uvValue}. ${tipMessage}`,
    },

    data: {
      current_uv: String(uvValue),
      uv_range_id: String(newRange.id),
    },
  };

  try {
    await messaging.send(message);

    console.log(`Notification sent to token ${fcmToken.slice(0, 10)}...`);
  } catch (error) {
    if (error.code === "messaging/registration-token-not-registered") {
      await pool.query("DELETE FROM devices WHERE fcm_token = $1", [fcmToken]);
    }
    console.error(`Error sending notification: ${error.message}`);
  }
}

async function processDevice(device) {
  const {
    id,
    latitude,
    longitude,
    fcm_token,
    uv_range_id: previousRangeId,
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

    await pool.query(
      `
      UPDATE devices
      SET current_uv = $1,
          uv_range_id = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      `,
      [uvValue, newRange.id, id]
    );

    if (isFirstRun) {
      console.log(
        `Device ${id} initialized with range ${newRange.code} (no notification).`
      );
      return;
    }

    if (rangeChanged) {
      await sendNotification(fcm_token, newRange, uvValue);
    }
  } catch (error) {
    console.error(`Error processing device ${id}: ${error.message}`);
  }
}

// UV monitoring cron job
async function runUvMonitorJob() {
  console.log("Starting UV monitoring cron job...");

  try {
    const { rows: devices } = await pool.query(
      `
      SELECT
        id,
        latitude,
        longitude,
        fcm_token,
        uv_range_id
      FROM devices
      `
    );

    console.log(`Processing ${devices.length} device(s)...`);

    for (const device of devices) {
      await processDevice(device);
    }

    console.log("Cron job finished.");
  } catch (error) {
    console.error(`General error in cron job: ${error.message}`);
  }
}

cron.schedule("0 */15 6-19 * * *", runUvMonitorJob, {
  timezone: "America/Bogota",
});

export { runUvMonitorJob, sendNotification };