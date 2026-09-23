import { Router } from "express";
import { listarTiposPiel } from "../controllers/Tipospiel.controller.js";

const router = Router();

router.get("/", listarTiposPiel);

export default router;