import { obtenerUv } from "../repositories/uv.repository.js";
import { findByFirebaseUidAndToken } from "../repositories/device.repository.js";
import { successResponse } from "../utils/response.utils.js";
import {
  obtenerRangoUV,
  obtenerMensajeRecomendacion,
} from "../utils/uvRango.util.js";
import {
  throwBadRequestFieldError,
  throwNotFoundError,
} from "../errors/throwHTTPErrors.js";

export async function obtenerInformacionUv(req, res) {
  const firebaseUid = req.user.uid;
  const { fcm_token } = req.query;

  if (!fcm_token) {
    throwBadRequestFieldError("fcm_token", "fcm_token es obligatorio");
  }

  const dispositivo = await findByFirebaseUidAndToken(
    firebaseUid,
    fcm_token
  );

  if (!dispositivo) {
    throwNotFoundError("Dispositivo no encontrado");
  }

  const uv = await obtenerUv(dispositivo.latitud, dispositivo.longitud);

  const rango = await obtenerRangoUV(uv.actual.uv);

  const recomendacion = rango
    ? {
        rango_uv_id: rango.id,
        nombre: rango.nombre,
        mensaje: obtenerMensajeRecomendacion(rango.nombre),
      }
    : null;

  return successResponse(res, 200, "Información UV obtenida correctamente", {
    ciudad: dispositivo.ciudad,
    ...uv,
    recomendacion,
  });
}