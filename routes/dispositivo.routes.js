import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middlewares.js";
import { sincronizar } from "../controllers/dispositivo.controller.js";

const router = Router();

router.post(
  "/",
  authenticateToken,
  sincronizar
);

export default router;