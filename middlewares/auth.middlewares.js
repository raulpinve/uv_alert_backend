import { getAuth } from "firebase-admin/auth";
import { app } from "../config/firebase.js";
import { pool } from "../init.db.js";

export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Token no proporcionado",
      });
    }

    const token = authHeader.split("Bearer ")[1];

    // 1. Verificar token de Firebase
    const decodedToken = await getAuth(app).verifyIdToken(token);

    const firebaseUid = decodedToken.uid;
    const nombreCompleto = decodedToken.name ?? "";

    // 2. Separar nombre y apellidos
    const partesNombre = nombreCompleto.trim().split(/\s+/);

    const nombre = partesNombre.shift() || "Usuario";
    const apellidos = partesNombre.join(" ") || null;

    // 3. Crear usuario si no existe
    //    Si ya existe, simplemente lo devuelve.
    const { rows } = await pool.query(
      `
      INSERT INTO usuarios (
        firebase_uid,
        nombre,
        apellidos
      )
      VALUES ($1, $2, $3)

      ON CONFLICT (firebase_uid)
      DO UPDATE SET
        nombre = EXCLUDED.nombre,
        apellidos = EXCLUDED.apellidos

      RETURNING
        id,
        firebase_uid,
        nombre,
        apellidos,
        fecha_registro
      `,
      [
        firebaseUid,
        nombre,
        apellidos,
      ]
    );

    // 4. Información de Firebase
    req.user = decodedToken;

    // 5. Usuario de PostgreSQL
    req.usuario = rows[0];

    // 6. Continuar
    next();

  } catch (error) {
    console.error("Error en authenticateToken:", error);

    return res.status(401).json({
      error: "Token inválido o error autenticando usuario",
    });
  }
}

// export function authenticateToken(req, res, next) {
//   req.user = {
//     uid: "google-user-123",
//     email: "prueba@gmail.com",
//     email_verified: true,
//     name: "Usuario Prueba",
//     firebase: {
//       sign_in_provider: "google.com",
//     },
//   };

//   next();
// }