import { respuestaExitosa } from "../utils/response.utils.js";
import { findById as findTipoPielById } from "../repositories/tiposPiel.repository.js";
import { updateTipoPiel } from "../repositories/user.repository.js";
import { throwBadRequestFieldError } from "../errors/throwHTTPErrors.js";

export async function registrarTipoPiel(req, res) {
  const firebaseUid = req.user.uid;
  const { tipo_piel_id } = req.body;

  if (!tipo_piel_id) {
    throwBadRequestFieldError("tipo_piel_id", "tipo_piel_id es requerido");
  }

  const tipoPiel = await findTipoPielById(tipo_piel_id);
  if (!tipoPiel) {
    throwBadRequestFieldError(
      "tipo_piel_id",
      "tipo_piel_id no existe en el catálogo"
    );
  }

  const usuarioActualizado = await updateTipoPiel(firebaseUid, tipo_piel_id);
  if (!usuarioActualizado) {
    throwNotFoundError("Usuario no encontrado");
  }

  return respuestaExitosa(
    res,
    200,
    "Tipo de piel registrado correctamente",
    usuarioActualizado
  );
}