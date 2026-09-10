import { getAuth } from "firebase-admin/auth";
import { app } from "../config/firebase.js"; // ajusta la ruta según tu proyecto

export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Token no proporcionado",
      });
    }

    const token = authHeader.split("Bearer ")[1];

    const decodedToken = await getAuth(app).verifyIdToken(token);

    req.user = decodedToken;

    next();
  } catch (error) {
    return res.status(401).json({
      error: "Token inválido o expirado",
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