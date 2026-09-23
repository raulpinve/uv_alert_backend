import { pool } from "../init.db.js";
import {
  sincronizarDispositivo,
  eliminarDispositivoPorFirebaseUid,
} from "../repositories/dispositivo.repository.js";
import {
  throwBadRequestFieldError,
  throwBadRequestErrorWithMultipleErrors,
  throwNotFoundError,
  throwBadRequestMultiple,
} from "../errors/throwHTTPErrors.js";
import { respuestaExitosa } from "../utils/response.utils.js";

export async function sincronizar(req, res) {
  const firebaseUid = req.user.uid;
  const { fcm_token, latitud, longitud } = req.body;

  const camposFaltantes = [];
  if (!fcm_token) {
    camposFaltantes.push({ field: "fcm_token", message: "fcm_token es obligatorio" });
  }
  if (latitud === undefined) {
    camposFaltantes.push({ field: "latitud", message: "latitud es obligatoria" });
  }
  if (longitud === undefined) {
    camposFaltantes.push({ field: "longitud", message: "longitud es obligatoria" });
  }

  if (camposFaltantes.length > 0) {
    throwBadRequestMultiple(camposFaltantes, "Faltan campos obligatorios");
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
    throwNotFoundError("Usuario no encontrado");
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
}

export async function desregistrar(req, res) {
  const firebaseUid = req.user.uid;
  const { fcm_token } = req.body;

  if (!fcm_token) {
    throwBadRequestFieldError("fcm_token", "fcm_token es obligatorio");
  }

  await eliminarDispositivoPorFirebaseUid(firebaseUid, fcm_token);

  return respuestaExitosa(res, 200, "Dispositivo desregistrado correctamente");
}