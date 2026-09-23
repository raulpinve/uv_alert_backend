import {
  syncDevice as syncDeviceInDb,
  deleteByFirebaseUid,
} from "../repositories/device.repository.js";
import { findByFirebaseUid } from "../repositories/user.repository.js";
import {
  throwBadRequestFieldError,
  throwBadRequestMultiple,
  throwNotFoundError,
} from "../errors/throwHTTPErrors.js";
import { successResponse } from "../utils/response.utils.js";

export async function syncDevice(req, res) {
  const firebaseUid = req.user.uid;
  const { fcm_token, latitude, longitude } = req.body;

  const missingFields = [];
  if (!fcm_token) {
    missingFields.push({
      field: "fcm_token",
      message: "El token FCM es obligatorio",
    });
  }
  if (latitude === undefined) {
    missingFields.push({
      field: "latitude",
      message: "La latitud es obligatoria",
    });
  }
  if (longitude === undefined) {
    missingFields.push({
      field: "longitude",
      message: "La longitud es obligatoria",
    });
  }

  if (missingFields.length > 0) {
    throwBadRequestMultiple(missingFields, "Faltan campos obligatorios");
  }

  const user = await findByFirebaseUid(firebaseUid);
  if (!user) {
    throwNotFoundError("Usuario no encontrado");
  }

  const device = await syncDeviceInDb(user.id, fcm_token, latitude, longitude);

  return successResponse(
    res,
    200,
    "Dispositivo sincronizado correctamente",
    device
  );
}

export async function unregisterDevice(req, res) {
  const firebaseUid = req.user.uid;
  const { fcm_token } = req.body;

  if (!fcm_token) {
    throwBadRequestFieldError("fcm_token", "El token FCM es obligatorio");
  }

  await deleteByFirebaseUid(firebaseUid, fcm_token);

  return successResponse(res, 200, "Dispositivo desregistrado correctamente");
}