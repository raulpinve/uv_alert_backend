import { Router } from "express";
import { verifyFirebaseToken } from "../middlewares/auth.middlewares.js";
import handleValidationErrors from "../middlewares/error.validators.middleware.js";
import { getUvInfoValidator } from "../validators/uv.validators.js";
import { getUvInfo } from "../controllers/uv.controller.js";

const router = Router();

router.get(
  "/",
  verifyFirebaseToken,
  getUvInfoValidator,
  handleValidationErrors,
  getUvInfo
);

export default router;