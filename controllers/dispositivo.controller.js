import { pool } from "../init.db.js";
import { sincronizarDispositivo } from "../repositories/dispositivo.repository.js";
import {
  respuestaExitosa,
  respuestaError
} from "../utils/response.utils.js";

export async function sincronizar(req, res) {
  try {
    const firebaseUid = req.user.uid;
    const { fcm_token, latitud, longitud } = req.body;

    if (!fcm_token || latitud === undefined || longitud === undefined) {
      return respuestaError(
        res,
        400,
        "fcm_token, latitud y longitud son obligatorios"
      );
    }

    const { rows } = await pool.query(
      `
      SELECT id
      FROM usuarios
      WHERE firebase_uid = $1
      `,
      [firebaseUid]
    );

    if (rows.length === 0) {
      return respuestaError(
        res,
        404,
        "Usuario no encontrado"
      );
    }

    const usuarioId = rows[0].id;

    const dispositivo = await sincronizarDispositivo(
      usuarioId,
      fcm_token,
      latitud,
      longitud
    );

    return respuestaExitosa(
      res,
      200,
      "Dispositivo sincronizado correctamente",
      dispositivo
    );

  } catch (error) {
    console.error("Error al sincronizar dispositivo:", error);

    return respuestaError(
      res,
      500,
      "Error interno del servidor"
    );
  }
}