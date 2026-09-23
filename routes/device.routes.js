import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middlewares.js";
import handleValidationErrors from "../middlewares/error.validators.middleware.js";
import {
  syncDeviceValidator,
  unregisterDeviceValidator,
} from "../validators/device.validators.js";
import {
  syncDevice,
  unregisterDevice,
} from "../controllers/device.controller.js";

const router = Router();

router.post(
  "/",
  authenticateToken,
  syncDeviceValidator,
  handleValidationErrors,
  syncDevice
);

router.delete(
  "/",
  authenticateToken,
  unregisterDeviceValidator,
  handleValidationErrors,
  unregisterDevice
);

export default router;