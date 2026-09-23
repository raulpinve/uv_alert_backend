
/**
 * Busca un usuario por su firebase_uid.
 */
export async function findByFirebaseUid(firebaseUid) {
  const { rows } = await pool.query(
    `SELECT id, firebase_uid, nombre, apellidos, tipo_piel_id, fecha_registro
     FROM usuarios
     WHERE firebase_uid = $1`,
    [firebaseUid]
  );
  return rows[0] || null;
}

/**
 * Actualiza (registra) el tipo de piel de un usuario, identificado por firebase_uid.
 * Devuelve el usuario actualizado, o null si no existe.
 */
export async function updateTipoPiel(firebaseUid, tipoPielId) {
  const { rows } = await pool.query(
    `UPDATE usuarios
     SET tipo_piel_id = $2
     WHERE firebase_uid = $1
     RETURNING id, firebase_uid, nombre, apellidos, tipo_piel_id`,
    [firebaseUid, tipoPielId]
  );
  return rows[0] || null;
}
import { pool } from "../init.db.js";

