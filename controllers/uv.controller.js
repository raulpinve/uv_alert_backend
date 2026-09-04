import { obtenerUv } from "../repositories/uv.repository.js";
import { obtenerCiudad } from "../repositories/geocoding.repository.js";
import {
  respuestaExitosa,
  respuestaError
} from "../utils/response.utils.js";

export async function obtenerInformacionUv(req, res) {
  try {
    const { latitud, longitud } = req.query;

    if (latitud === undefined || longitud === undefined) {
      return respuestaError(
        res,
        400,
        "latitud y longitud son obligatorias"
      );
    }

    const lat = Number(latitud);
    const lon = Number(longitud);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      return respuestaError(
        res,
        400,
        "Latitud o longitud inválida"
      );
    }

    const [uv, ciudad] = await Promise.all([
      obtenerUv(lat, lon),
      obtenerCiudad(lat, lon)
    ]);

    const informacionUv = {
      ciudad,
      ...uv
    };

    return respuestaExitosa(
      res,
      200,
      "Información UV obtenida correctamente",
      informacionUv
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