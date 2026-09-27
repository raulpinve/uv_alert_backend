import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middlewares.js";
import handleValidationErrors from "../middlewares/error.validators.middleware.js";
import { updateProfileValidator } from "../validators/user.validators.js";
import { getUserInfo, updateProfile } from "../controllers/user.controller.js";

const router = Router();

router.get(
  "/me", 
  authenticateToken, 
  getUserInfo
);

router.patch(
  "/me",
  authenticateToken,
  updateProfileValidator,
  handleValidationErrors,
  updateProfile
);

export default router;