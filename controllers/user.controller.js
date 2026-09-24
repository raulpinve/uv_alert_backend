import { successResponse } from "../utils/response.utils.js";
import { findSkinTypeById } from "../repositories/skinTypes.repository.js";
import { updateSkinType } from "../repositories/user.repository.js";
import {
  throwBadRequestFieldError,
  throwNotFoundError,
} from "../errors/throwHTTPErrors.js";

export async function registerSkinType(req, res) {
  const firebaseUid = req.user.uid;
  const { skinTypeId } = req.body;

  const skinType = await findSkinTypeById(skinTypeId);
  if (!skinType) {
    throwBadRequestFieldError(
      "skinTypeId",
      "El tipo de piel seleccionado no existe"
    );
  }

  const updatedUser = await updateSkinType(firebaseUid, skinTypeId);
  if (!updatedUser) {
    throwNotFoundError("Usuario no encontrado");
  }

  return successResponse(
    res,
    200,
    "Tipo de piel registrado correctamente",
    updatedUser
  );
}