import { obtenerUv } from "../repositories/uv.repository.js";
import { obtenerDispositivoPorFirebaseUid } from "../repositories/dispositivo.repository.js";
import { respuestaExitosa } from "../utils/response.utils.js";
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

  const dispositivo = await obtenerDispositivoPorFirebaseUid(
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

  return respuestaExitosa(res, 200, "Información UV obtenida correctamente", {
    ciudad: dispositivo.ciudad,
    ...uv,
    recomendacion,
  });
}