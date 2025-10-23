import { Router } from "express";
import { createCardsInTransaction, getCardsInTransactions } from "../controller/cardsInTransaction.controller.ts";

const router = Router();

router.post("/cardsInTransactions", createCardsInTransaction);
router.get("/cardsInTransactions", getCardsInTransactions);

export default router;