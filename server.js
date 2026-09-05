import express from 'express';
import "dotenv/config";
import './jobs/uvAlert.job.js';

import userRoutes from './routes/user.routes.js';
import dispositivoRoutes from "./routes/dispositivo.routes.js";
import uvRoutes from './routes/uv.routes.js'

const app = express();
const port = 3000;
app.use(express.json());

app.use("/dispositivos", dispositivoRoutes);
app.use("/usuarios", userRoutes);
app.use("/uv", uvRoutes);


// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
