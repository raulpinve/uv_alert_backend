import { pool } from "../init.db.js";
import { calculateDistanceMeters } from "../utils/distance.utils.js";
import { getCity } from "./geocoding.repository.js";

const MIN_DISTANCE_FOR_CITY_UPDATE_METERS = 500;

export async function syncDevice(userId, fcmToken, latitude, longitude) {
  const currentDevice = await findByToken(fcmToken);

  let city = currentDevice?.city ?? null;

  const shouldUpdateCity =
    !currentDevice ||
    !currentDevice.city ||
    currentDevice.latitude == null ||
    currentDevice.longitude == null ||
    calculateDistanceMeters(
      Number(currentDevice.latitude),
      Number(currentDevice.longitude),
      Number(latitude),
      Number(longitude)
    ) >= MIN_DISTANCE_FOR_CITY_UPDATE_METERS;

  if (shouldUpdateCity) {
    city = await getCity(latitude, longitude);
  }

  const { rows } = await pool.query(
    `
    INSERT INTO devices (
      user_id,
      fcm_token,
      latitude,
      longitude,
      city
    )
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (fcm_token)
    DO UPDATE SET
      user_id = EXCLUDED.user_id,
      latitude = EXCLUDED.latitude,
      longitude = EXCLUDED.longitude,
      city = EXCLUDED.city,
      updated_at = CURRENT_TIMESTAMP
    RETURNING
      id,
      user_id,
      fcm_token,
      latitude,
      longitude,
      city,
      current_uv,
      uv_range_id,
      updated_at
    `,
    [userId, fcmToken, latitude, longitude, city]
  );

  return rows[0];
}

async function findByToken(fcmToken) {
  const { rows } = await pool.query(
    `
    SELECT
      id,
      latitude,
      longitude,
      city
    FROM devices
    WHERE fcm_token = $1
    `,
    [fcmToken]
  );

  return rows[0] ?? null;
}

export async function findByFirebaseUidAndToken(firebaseUid, fcmToken) {
  const { rows } = await pool.query(
    `
    SELECT
      d.id,
      d.user_id,
      d.fcm_token,
      d.latitude,
      d.longitude,
      d.city,
      d.current_uv,
      d.uv_range_id,
      d.updated_at
    FROM devices d
    INNER JOIN users u
      ON u.id = d.user_id
    WHERE u.firebase_uid = $1
      AND d.fcm_token = $2
    `,
    [firebaseUid, fcmToken]
  );

  return rows[0] ?? null;
}

export async function deleteByFirebaseUid(firebaseUid, fcmToken) {
  await pool.query(
    `
    DELETE FROM devices d
    USING users u
    WHERE d.user_id = u.id
      AND u.firebase_uid = $1
      AND d.fcm_token = $2
    `,
    [firebaseUid, fcmToken]
  );
}