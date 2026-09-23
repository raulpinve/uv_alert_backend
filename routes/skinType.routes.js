import { Router } from "express";
import { listSkinTypes } from "../controllers/skinType.controller.js";

const router = Router();

router.get("/", listSkinTypes);

export default router;