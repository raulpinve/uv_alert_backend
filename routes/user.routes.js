import { Router } from "express";
import { verifyFirebaseToken } from "../middlewares/auth.middlewares.js";
import handleValidationErrors from "../middlewares/error.validators.middleware.js";
import { updateProfileValidator } from "../validators/user.validators.js";
import { getUserInfo, updateProfile } from "../controllers/user.controller.js";

const router = Router();

router.get(
  "/me", 
  verifyFirebaseToken, 
  getUserInfo
);

router.patch(
  "/me",
  verifyFirebaseToken,
  updateProfileValidator,
  handleValidationErrors,
  updateProfile
);

export default router;