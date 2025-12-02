import express from "express";
import pool from "../data/db.ts";
import type {ResultSetHeader} from "mysql2";

const router = express.Router();

interface TransactionData {
    cardID: string
    quantity: number
    card_price: number
    total_price: number
    selectedDeckID: string
    is_foil: boolean
    buyerName: string
    sellerName: string
}

router.post("/transaction", async (req, res) => {

    const {
        cardID,
        quantity,
        card_price,
        total_price,
        is_foil,
        buyerName,
        sellerName,
    }: TransactionData = req.body;
    console.log(cardID, quantity, card_price, total_price, is_foil ? 1 : 0, buyerName, sellerName);
    const foil = is_foil ? 1 : 0;
    try {
      const [result]: any = await pool.query(
        "INSERT INTO Transaction_Staging (cardID, quantity, card_price, is_foil, total_price, buyerName, sellerName) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [cardID, quantity, card_price, foil, total_price, buyerName, sellerName],
      );
      res.status(201).json({ message: "Transaction staged successfully",
          id: result.insertId,
      });
    } catch (error) {console.error("Error inserting transaction:", error);
      res.status(500).json({ error: "Failed to create transaction" });
    }
});

export default router;