import { getUv } from "../repositories/uv.repository.js";
import { findByFirebaseUidAndToken } from "../repositories/device.repository.js";
import { successResponse } from "../utils/response.utils.js";
import {
  getUvRange,
  getRecommendationMessage,
} from "../utils/uvRange.utils.js";
import {
  throwBadRequestFieldError,
  throwNotFoundError,
} from "../errors/throwHTTPErrors.js";

export async function getUvInfo(req, res) {
  const firebaseUid = req.user.uid;
  const { fcm_token } = req.query;

  if (!fcm_token) {
    throwBadRequestFieldError("fcm_token", "El token FCM es obligatorio");
  }

  const device = await findByFirebaseUidAndToken(firebaseUid, fcm_token);

  if (!device) {
    throwNotFoundError("Dispositivo no encontrado");
  }

  const uv = await getUv(device.latitude, device.longitude);

  const uvRange = await getUvRange(uv.current.uv);

  const recommendation = uvRange
    ? {
        uv_range_id: uvRange.id,
        code: uvRange.code,
        name: uvRange.name,
        message: getRecommendationMessage(uvRange.code),
      }
    : null;

  return successResponse(res, 200, "Información UV obtenida correctamente", {
    city: device.city,
    ...uv,
    recommendation,
  });
}