import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middlewares.js";
import { registrarUsuario } from "../controllers/user.controller.js";
const router = Router();

router.post(
  "/usuarios",
  authenticateToken,
  registrarUsuario
);

export default router;