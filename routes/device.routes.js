import { Router } from "express";
import { verifyFirebaseToken } from "../middlewares/auth.middlewares.js";
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
  verifyFirebaseToken,
  syncDeviceValidator,
  handleValidationErrors,
  syncDevice
);

router.delete(
  "/",
  verifyFirebaseToken,
  unregisterDeviceValidator,
  handleValidationErrors,
  unregisterDevice
);

export default router;