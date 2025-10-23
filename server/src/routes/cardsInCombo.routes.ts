import { Router } from "express";
import { createCardsInCombo, getCardsInCombos } from "../controller/cardsInCombo.controller.ts";

const router = Router();

router.post("/cardsInCombos", createCardsInCombo);
router.get("/cardsInCombos", getCardsInCombos);

export default router;