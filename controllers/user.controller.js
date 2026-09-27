import { successResponse } from "../utils/response.utils.js";
import { findSkinTypeById } from "../repositories/skinTypes.repository.js";
import { findByFirebaseUid, updateUserProfile } from "../repositories/user.repository.js";
import {
  throwBadRequestFieldError,
  throwNotFoundError,
} from "../errors/throwHTTPErrors.js";

export async function updateProfile(req, res) {
  const firebaseUid = req.user.uid;
  const { firstName, lastName, skinTypeId } = req.body;

  const fields = {};

  if (firstName !== undefined) fields.firstName = firstName;
  if (lastName !== undefined) fields.lastName = lastName;

  if (skinTypeId !== undefined) {
    const skinTypeRow = await findSkinTypeById(skinTypeId);
    if (!skinTypeRow) {
      throwBadRequestFieldError(
        "skinTypeId",
        "El tipo de piel seleccionado no existe"
      );
    }
    fields.skinTypeId = skinTypeId;
  }

  if (Object.keys(fields).length === 0) {
    throwBadRequestFieldError("body", "No se enviaron campos para actualizar");
  }

  const updatedUser = await updateUserProfile(firebaseUid, fields);
  if (!updatedUser) {
    throwNotFoundError("Usuario no encontrado");
  }

  return successResponse(
    res,
    200,
    "Perfil actualizado correctamente",
    updatedUser
  );
}

export async function getUserInfo(req, res) {
  const { uid } = req.user;
  const user = await findByFirebaseUid(uid);

  if (!user) {
    throwNotFoundError("Usuario no encontrado");
  }

  return successResponse(
    res,
    200,
    "Información del usuario obtenida correctamente",
    user
  );
}