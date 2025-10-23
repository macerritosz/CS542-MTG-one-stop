import { Router } from "express";
import { createDeck, getDecks } from "../controller/deck.controller.ts";

const router = Router();

router.post("/decks", createDeck);
router.get("/decks", getDecks);

export default router;