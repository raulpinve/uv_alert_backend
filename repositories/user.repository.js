import camelcaseKeys from "camelcase-keys";
import { pool } from "../init.db.js";

/**
 * Finds a user by their firebase_uid.
 */
export async function findByFirebaseUid(firebaseUid) {
  const { rows } = await pool.query(
    `SELECT id, firebase_uid, first_name, last_name, skin_type_id, registered_at
     FROM users
     WHERE firebase_uid = $1`,
    [firebaseUid]
  );
  return rows[0] ? camelcaseKeys(rows[0]) : null;
}

/**
 * Updates (registers) a user's skin type, identified by firebase_uid.
 * Returns the updated user, or null if the user does not exist.
 */
export async function updateSkinType(firebaseUid, skinTypeId) {
  const { rows } = await pool.query(
    `UPDATE users
     SET skin_type_id = $2
     WHERE firebase_uid = $1
     RETURNING id, firebase_uid, first_name, last_name, skin_type_id`,
    [firebaseUid, skinTypeId]
  );
  return rows[0] ? camelcaseKeys(rows[0]) : null;
}