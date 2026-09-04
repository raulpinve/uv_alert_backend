import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middlewares.js";
import { obtenerInformacionUv } from "../controllers/uv.controller.js";

const router = Router();

router.get("/", authenticateToken, obtenerInformacionUv);

export default router;