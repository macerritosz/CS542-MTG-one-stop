import { Router } from "express";
import { createCombo, getCombos } from "../controller/combo.controller.ts";

const router = Router();

router.post("/combos", createCombo);
router.get("/combos", getCombos);

export default router;