import express from 'express';
import { initializeApp, cert } from "firebase-admin/app";
import serviceAccount from "./firebase-credentials.json" with { type: "json" };
import "dotenv/config";

const app = express();
const port = 3000;
app.use(express.json());

initializeApp({
  credential: cert(serviceAccount),
});

// Rutas
import userRoutes from './routes/user.routes.js';
import dispositivoRoutes from "./routes/dispositivo.routes.js";

app.use("/dispositivos", dispositivoRoutes);
app.use("/usuarios", userRoutes);

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
