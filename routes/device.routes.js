import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middlewares.js";
import {
  syncDevice,
  unregisterDevice,
} from "../controllers/device.controller.js";

const router = Router();

router.post("/", authenticateToken, syncDevice);

router.delete("/", authenticateToken, unregisterDevice);

export default router;