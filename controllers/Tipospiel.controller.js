import { findAll } from "../repositories/skinTypes.repository.js";
import { successResponse } from "../utils/response.utils.js";

/**
 * GET /api/tipos-piel
 * Devuelve el catálogo completo, útil para poblar un selector en la app.
 */
export async function listarTiposPiel(req, res) {
  const tipos = await findAll();

  return successResponse(
    res,
    200,
    "Tipos de piel obtenidos correctamente",
    tipos
  );
}