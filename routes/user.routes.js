import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middlewares.js";
import { registrarTipoPiel } from "../controllers/user.controller.js";

const router = Router();

router.patch("/tipo-piel", authenticateToken, registrarTipoPiel);

export default router;