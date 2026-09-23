import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middlewares.js";
import { registerSkinType } from "../controllers/user.controller.js";

const router = Router();

router.patch("/skin-type", authenticateToken, registerSkinType);

export default router;