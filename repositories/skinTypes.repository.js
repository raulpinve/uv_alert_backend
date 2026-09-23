import { pool } from "../init.db.js";

/**
 * Devuelve todo el catálogo de tipos de piel (escala Fitzpatrick).
 */
export async function findAll() {
  const { rows } = await pool.query(
    `SELECT id, escala, nombre, descripcion, factor_sensibilidad
     FROM tipos_piel
     ORDER BY id`
  );
  return rows;
}

/**
 * Busca un tipo de piel por id. Devuelve null si no existe.
 */
export async function findById(id) {
  const { rows } = await pool.query(
    `SELECT id, escala, nombre, descripcion, factor_sensibilidad
     FROM tipos_piel
     WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}
