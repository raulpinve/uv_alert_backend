import {
  syncDevice as syncDeviceInDb,
  deleteByFirebaseUid,
} from "../repositories/device.repository.js";
import { findByFirebaseUid } from "../repositories/user.repository.js";
import { throwNotFoundError } from "../errors/throwHTTPErrors.js";
import { successResponse } from "../utils/response.utils.js";

export async function syncDevice(req, res) {
  const firebaseUid = req.user.uid;
  const { fcmToken, latitude, longitude } = req.body;

  const user = await findByFirebaseUid(firebaseUid);
  if (!user) {
    throwNotFoundError("Usuario no encontrado");
  }

  const device = await syncDeviceInDb(user.id, fcmToken, latitude, longitude);

  return successResponse(
    res,
    200,
    "Dispositivo sincronizado correctamente",
    device
  );
}

export async function unregisterDevice(req, res) {
  const firebaseUid = req.user.uid;
  const { fcmToken } = req.body;

  await deleteByFirebaseUid(firebaseUid, fcmToken);

  return successResponse(res, 200, "Dispositivo desregistrado correctamente");
}