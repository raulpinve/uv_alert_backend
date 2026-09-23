import express from 'express';
import "dotenv/config";
import userRoutes from './routes/user.routes.js';
import dispositivoRoutes from "./routes/dispositivo.routes.js";
import uvRoutes from './routes/uv.routes.js'
import tiposPielRoutes from "./routes/Tipospiel.routes.js";
import handleErrorResponse from "./errors/handleErrorResponse.js";
// import './jobs/uvAlert.job.js';

const app = express();
const port = process.env.PORT;
app.use(express.json());

app.use("/dispositivos", dispositivoRoutes);
app.use("/usuarios", userRoutes);
app.use("/uv", uvRoutes);
app.use("/tipos-piel", tiposPielRoutes);
app.use("/usuarios", userRoutes);
app.use(handleErrorResponse);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
