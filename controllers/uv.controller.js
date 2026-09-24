import { getUv } from "../repositories/uv.repository.js";
import { findByFirebaseUidAndToken } from "../repositories/device.repository.js";
import { successResponse } from "../utils/response.utils.js";
import {
  getUvRange,
  getRecommendationMessage,
} from "../utils/uvRange.utils.js";
import { throwNotFoundError } from "../errors/throwHTTPErrors.js";

export async function getUvInfo(req, res) {
  const firebaseUid = req.user.uid;
  const { fcmToken } = req.query;

  const device = await findByFirebaseUidAndToken(firebaseUid, fcmToken);

  if (!device) {
    throwNotFoundError("Dispositivo no encontrado");
  }

  const uv = await getUv(device.latitude, device.longitude);

  const uvRange = await getUvRange(uv.current.uv);

  const recommendation = uvRange
    ? {
        uvRangeId: uvRange.id,
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