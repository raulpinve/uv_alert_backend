import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middlewares.js";
import handleValidationErrors from "../middlewares/error.validators.middleware.js";
import { registerSkinTypeValidator } from "../validators/user.validators.js";
import { registerSkinType } from "../controllers/user.controller.js";

const router = Router();

router.patch(
  "/skin-type",
  authenticateToken,
  registerSkinTypeValidator,
  handleValidationErrors,
  registerSkinType
);

export default router;