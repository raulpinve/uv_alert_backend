import { pool } from "../init.db.js";
import { calcularDistanciaMetros } from "../utils/distancia.utils.js";
import { obtenerCiudad } from "./geocoding.repository.js";

const DISTANCIA_MINIMA_CIUDAD = 500;

export async function sincronizarDispositivo(
  usuarioId,
  fcmToken,
  latitud,
  longitud
) {
  const dispositivoActual = await obtenerDispositivoPorToken(fcmToken);

  let ciudad = dispositivoActual?.ciudad ?? null;

  const debeActualizarCiudad =
    !dispositivoActual ||
    !dispositivoActual.ciudad ||
    dispositivoActual.latitud == null ||
    dispositivoActual.longitud == null ||
    calcularDistanciaMetros(
      Number(dispositivoActual.latitud),
      Number(dispositivoActual.longitud),
      Number(latitud),
      Number(longitud)
    ) >= DISTANCIA_MINIMA_CIUDAD;

  if (debeActualizarCiudad) {
    ciudad = await obtenerCiudad(latitud, longitud);
  }

  const { rows } = await pool.query(
    `
    INSERT INTO dispositivos (
      usuario_id,
      fcm_token,
      latitud,
      longitud,
      ciudad
    )
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (fcm_token)
    DO UPDATE SET
      usuario_id = EXCLUDED.usuario_id,
      latitud = EXCLUDED.latitud,
      longitud = EXCLUDED.longitud,
      ciudad = EXCLUDED.ciudad,
      fecha_actualizacion = CURRENT_TIMESTAMP
    RETURNING
      id,
      usuario_id,
      fcm_token,
      latitud,
      longitud,
      ciudad,
      uv_actual,
      rango_uv_id,
      fecha_actualizacion
    `,
    [usuarioId, fcmToken, latitud, longitud, ciudad]
  );

  return rows[0];
}

async function obtenerDispositivoPorToken(fcmToken) {
  const { rows } = await pool.query(
    `
    SELECT
      id,
      latitud,
      longitud,
      ciudad
    FROM dispositivos
    WHERE fcm_token = $1
    `,
    [fcmToken]
  );

  return rows[0] ?? null;
}

export async function obtenerDispositivoPorFirebaseUid(
  firebaseUid,
  fcmToken
) {
  const { rows } = await pool.query(
    `
    SELECT
      d.id,
      d.usuario_id,
      d.fcm_token,
      d.latitud,
      d.longitud,
      d.ciudad,
      d.uv_actual,
      d.rango_uv_id,
      d.fecha_actualizacion
    FROM dispositivos d
    INNER JOIN usuarios u
      ON u.id = d.usuario_id
    WHERE u.firebase_uid = $1
      AND d.fcm_token = $2
    `,
    [firebaseUid, fcmToken]
  );

  return rows[0] ?? null;
}

export async function eliminarDispositivoPorFirebaseUid(
  firebaseUid,
  fcmToken
) {
  await pool.query(
    `
    DELETE FROM dispositivos d
    USING usuarios u
    WHERE d.usuario_id = u.id
      AND u.firebase_uid = $1
      AND d.fcm_token = $2
    `,
    [firebaseUid, fcmToken]
  );
}