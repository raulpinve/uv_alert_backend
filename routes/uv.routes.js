import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middlewares.js";
import handleValidationErrors from "../middlewares/error.validators.middleware.js";
import { getUvInfoValidator } from "../validators/uv.validators.js";
import { getUvInfo } from "../controllers/uv.controller.js";

const router = Router();

router.get(
  "/",
  authenticateToken,
  getUvInfoValidator,
  handleValidationErrors,
  getUvInfo
);

export default router;