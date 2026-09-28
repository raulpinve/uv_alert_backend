import { getAuth } from "firebase-admin/auth";
import { app } from "../config/firebase.js";
import { pool } from "../init.db.js";

// uids que ya sabemos que existen en la BD (cache en memoria).
const knownUsers = new Set();

async function ensureUserExists(firebaseUid, nombre, apellidos) {
  if (knownUsers.has(firebaseUid)) return;

  const { rowCount } = await pool.query(
    "SELECT 1 FROM users WHERE firebase_uid = $1",
    [firebaseUid]
  );

  if (rowCount === 0) {
    await pool.query(
      `
      INSERT INTO users (firebase_uid, first_name, last_name)
      VALUES ($1, $2, $3)
      ON CONFLICT (firebase_uid) DO NOTHING
      `,
      [firebaseUid, nombre, apellidos]
    );
  }

  knownUsers.add(firebaseUid);
}

export async function authenticateToken(req, res, next) {
  try {
    let firebaseUid;
    let nombre;
    let apellidos;

    if (process.env.MOCK_AUTH === "true") {
      // --- MOCK: solo para desarrollo local ---
      firebaseUid = "mock-uid-123";
      nombre = "Usuario";
      apellidos = "De Prueba";
    } else {
      const authHeader = req.headers.authorization;

      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({
          error: "Token no proporcionado",
        });
      }

      const token = authHeader.split("Bearer ")[1];

      // 1. Verificar token de Firebase
      const decodedToken = await getAuth(app).verifyIdToken(token);

      firebaseUid = decodedToken.uid;
      const nombreCompleto = decodedToken.name ?? "";

      // 2. Separar nombre y apellidos
      const partesNombre = nombreCompleto.trim().split(/\s+/);

      nombre = partesNombre.shift() || "Usuario";
      apellidos = partesNombre.join(" ") || null;
    }

    // 3. Crear el usuario solo si no existe (y solo una vez por uid)
    await ensureUserExists(firebaseUid, nombre, apellidos);

    // 4. Información de Firebase
    req.user = {
      uid: firebaseUid,
    };

    // 5. Continuar
    next();
  } catch (error) {
    console.error("Error en authenticateToken:", error);

    return res.status(401).json({
      error: "Token inválido o error autenticando usuario",
    });
  }
}