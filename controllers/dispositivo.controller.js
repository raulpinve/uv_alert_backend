import { pool } from "../init.db.js";
import {
  sincronizarDispositivo,
  eliminarDispositivoPorFirebaseUid
} from "../repositories/dispositivo.repository.js";
import { throwBadRequestError, throwNotFoundError } from "../errors/throwHTTPErrors.js";
import {
  respuestaExitosa,
  respuestaError
} from "../utils/response.utils.js";

export async function sincronizar(req, res, next) {
  try {
    const firebaseUid = req.user.uid;
    const { fcm_token, latitud, longitud } = req.body;

    if (!fcm_token || latitud === undefined || longitud === undefined) {
      throwBadRequestError("fcm_token, latitud y longitud son obligatorios");
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

   next(error);
  }
}

export async function desregistrar(req, res, next) {
  try {
    const firebaseUid = req.user.uid;
    const { fcm_token } = req.body;

    if (!fcm_token) {
      return respuestaError(
        res,
        400,
        "fcm_token es obligatorio"
      );
    }

    await eliminarDispositivoPorFirebaseUid(
      firebaseUid,
      fcm_token
    );

    return respuestaExitosa(
      res,
      200,
      "Dispositivo desregistrado correctamente"
    );

  } catch (error) {
    console.error("Error al desregistrar dispositivo:", error);
    next(error);
  }
}