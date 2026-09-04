import { pool } from "../init.db.js";
import {
  respuestaExitosa,
  respuestaError
} from "../utils/response.utils.js";

export async function registrarUsuario(req, res) {
  try {
    const firebaseUid = req.firebaseUser.uid;
    const nombreCompleto = req.firebaseUser.name;

    const partesNombre = nombreCompleto?.trim().split(/\s+/) || [];

    const nombre = partesNombre.shift() || null;
    const apellidos = partesNombre.join(" ") || null;

    const { rows } = await pool.query(
      `
      INSERT INTO usuarios (
        firebase_uid,
        nombre,
        apellidos
      )
      VALUES ($1, $2, $3)
      ON CONFLICT (firebase_uid) DO NOTHING
      RETURNING id, firebase_uid, nombre, apellidos, fecha_registro
      `,
      [firebaseUid, nombre, apellidos]
    );

    if (rows.length === 0) {
      const { rows: usuario } = await pool.query(
        `
        SELECT
          id,
          firebase_uid,
          nombre,
          apellidos,
          fecha_registro
        FROM usuarios
        WHERE firebase_uid = $1
        `,
        [firebaseUid]
      );

      return respuestaExitosa(
        res,
        200,
        "Usuario ya registrado",
        usuario[0]
      );
    }

    return respuestaExitosa(
      res,
      201,
      "Usuario registrado correctamente",
      rows[0]
    );

  } catch (error) {
    console.error("Error al registrar usuario:", error);

    return respuestaError(
      res,
      500,
      "Error interno del servidor"
    );
  }
}