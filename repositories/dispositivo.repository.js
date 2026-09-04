import { pool } from "../init.db.js";

export async function sincronizarDispositivo(
  usuarioId,
  fcmToken,
  latitud,
  longitud
) {
  const { rows } = await pool.query(
    `
    INSERT INTO dispositivos (
      usuario_id,
      fcm_token,
      latitud,
      longitud
    )
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (fcm_token)
    DO UPDATE SET
      usuario_id = EXCLUDED.usuario_id,
      latitud = EXCLUDED.latitud,
      longitud = EXCLUDED.longitud,
      fecha_actualizacion = CURRENT_TIMESTAMP
    RETURNING
      id,
      usuario_id,
      fcm_token,
      latitud,
      longitud,
      uv_actual,
      rango_uv_id,
      fecha_actualizacion
    `,
    [usuarioId, fcmToken, latitud, longitud]
  );

  return rows[0];
}