import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middlewares.js";
import { getUvInfo } from "../controllers/uv.controller.js";

const router = Router();

router.get("/", authenticateToken, getUvInfo);

export default router;