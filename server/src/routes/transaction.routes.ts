import { Router } from "express";
import { createTransaction, getTransactions } from "../controller/transaction.controller.ts";

const router = Router();

router.post("/transactions", createTransaction);
router.get("/transactions", getTransactions);

export default router;