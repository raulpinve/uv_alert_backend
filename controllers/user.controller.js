import { successResponse } from "../utils/response.utils.js";
import { findById as findSkinTypeById } from "../repositories/skinTypes.repository.js";
import { updateSkinType } from "../repositories/user.repository.js";
import {
  throwBadRequestFieldError,
  throwNotFoundError,
} from "../errors/throwHTTPErrors.js";

export async function registerSkinType(req, res) {
  const firebaseUid = req.user.uid;
  const { skin_type_id } = req.body;

  const skinType = await findSkinTypeById(skin_type_id);
  if (!skinType) {
    throwBadRequestFieldError(
      "skin_type_id",
      "El tipo de piel seleccionado no existe"
    );
  }

  const updatedUser = await updateSkinType(firebaseUid, skin_type_id);
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