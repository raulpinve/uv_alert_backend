import { findAll } from "../repositories/skinTypes.repository.js";
import { successResponse } from "../utils/response.utils.js";

/**
 * GET /api/skin-types
 * Returns the full catalog, useful to populate a selector in the app.
 */
export async function listSkinTypes(req, res) {
  const skinTypes = await findAll();

  return successResponse(
    res,
    200,
    "Tipos de piel obtenidos correctamente",
    skinTypes
  );
}