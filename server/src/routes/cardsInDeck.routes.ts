import { Router } from "express";
import { createCardsInDeck, getCardsInDecks } from "../controller/cardsInDeck.controller.ts";

const router = Router();

router.post("/cardsInDecks", createCardsInDeck);
router.get("/cardsInDecks", getCardsInDecks);

export default router;