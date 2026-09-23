import { respuestaError, respuestaExitosa } from "../utils/response.utils.js";
import { findById as findTipoPielById } from "../repositories/tiposPiel.repository.js";
import { updateTipoPiel } from "../repositories/user.repository.js";

export async function registrarTipoPiel(req, res) {
  try {
    const firebaseUid = req.user.uid;
    const { tipo_piel_id } = req.body;

    if (!tipo_piel_id) {
      return respuestaError(res, 400, "tipo_piel_id es requerido");
    }

    const tipoPiel = await findTipoPielById(tipo_piel_id);
    if (!tipoPiel) {
      return respuestaError(res, 404, "tipo_piel_id no existe en el catálogo");
    }

    const usuarioActualizado = await updateTipoPiel(firebaseUid, tipo_piel_id);
    if (!usuarioActualizado) {
      return respuestaError(res, 404, "Usuario no encontrado");
    }

    return respuestaExitosa(
      res,
      200,
      "Tipo de piel registrado correctamente",
      usuarioActualizado
    );

  } catch (error) {
    console.error("Error al registrar tipo de piel:", error);
    return respuestaError(res, 500, "Error interno del servidor");
  }
}