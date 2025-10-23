import { Router } from "express";
import { createCard, getCards } from "../controller/card.controller.ts";

const router = Router();

router.post("/cards", createCard);
router.get("/cards", getCards);

export default router;