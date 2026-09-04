import express from 'express';
import { initializeApp, cert } from "firebase-admin/app";
import serviceAccount from "./firebase-credentials.json" with { type: "json" };
const app = express();
const port = 3000;
app.use(express.json());

initializeApp({
  credential: cert(serviceAccount),
});

// Rutas
import userRoutes from './routes/user.routes.js';
app.use("/users", userRoutes);


// TODO: Realizar sistema de autenticación de firebase
// TODO: - Crear ruta para guardar usuario
// TODO: - Guardar solo el firebase_id del usuario en la bd, la información del usuario se manejará en flutter con firebase
// TODO: - Crear sistema de verificación del token del usuario

// TODO: Dispositivos: 
// TODO: Crear endpoint para guardar la información del dispositivo: lat, long, token de FMC, firebase_id del usuario
// TODO: Crear endpoint para actualizar la información del dispositivo (lat, long, fecha_actualización)
// TODO: Eliminar dispositivo del dispositivo luego de que se cierre sesión

// TODO: Información del UV
// TODO: Endpoint para obtener la información actual del UV en el dispositivo

// TODO: Realizar el cronJob
// TODO: Obtener cada dispositivo junto con su latitud y longitud
// TODO: Realizar consulta en el uv 
// TODO: Verificar si hubo cambio de rango del UV
// TODO: Actualizar el nuevo valor del UV en la BD
// TODO: Enviar notificación al usuario si en verdad hubo cambio de rango

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
