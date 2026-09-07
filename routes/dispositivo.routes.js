import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middlewares.js";
import {
  sincronizar,
  desregistrar
} from "../controllers/dispositivo.controller.js";

const router = Router();

router.post(
  "/",
  authenticateToken,
  sincronizar
);

router.delete(
  "/",
  authenticateToken,
  desregistrar
);

export default router;