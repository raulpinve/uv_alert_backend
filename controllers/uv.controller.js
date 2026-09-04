import { obtenerUv } from "../repositories/uv.repository.js";
import { obtenerDispositivoPorFirebaseUid } from "../repositories/dispositivo.repository.js";
import {
  respuestaExitosa,
  respuestaError
} from "../utils/response.utils.js";

export async function obtenerInformacionUv(req, res) {
  try {
    const firebaseUid = req.user.uid;
    const { fcm_token } = req.query;

    if (!fcm_token) {
      return respuestaError(
        res,
        400,
        "fcm_token es obligatorio"
      );
    }

    const dispositivo = await obtenerDispositivoPorFirebaseUid(
      firebaseUid,
      fcm_token
    );

    if (!dispositivo) {
      return respuestaError(
        res,
        404,
        "Dispositivo no encontrado"
      );
    }

    const uv = await obtenerUv(
      dispositivo.latitud,
      dispositivo.longitud
    );

    return respuestaExitosa(
      res,
      200,
      "Información UV obtenida correctamente",
      {
        ciudad: dispositivo.ciudad,
        ...uv
      }
    );

  } catch (error) {
    console.error("Error al obtener información UV:", error);

    return respuestaError(
      res,
      500,
      "Error interno del servidor"
    );
  }
}