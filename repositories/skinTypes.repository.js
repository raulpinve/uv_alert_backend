import camelcaseKeys from "camelcase-keys";
import { pool } from "../init.db.js";

export async function findAllSkinTypes() {
  const { rows } = await pool.query(
    `SELECT id, scale, name, description, sensitivity_factor
     FROM skin_types
     ORDER BY id`
  );
  return camelcaseKeys(rows);
}

export async function findSkinTypeById(id) {
  const { rows } = await pool.query(
    `SELECT id, scale, name, description, sensitivity_factor
     FROM skin_types
     WHERE id = $1`,
    [id]
  );
  return rows[0] ? camelcaseKeys(rows[0]) : null;
}