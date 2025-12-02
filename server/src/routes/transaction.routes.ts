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

router.get("/transaction", async (req, res) => {
    const username = req.query.name;
    try {
        const [rows]: any = await pool.query(
            `SELECT
                    t.transaction_time,
                    t.total_price,
                    pit.buyerName,
                    pit.sellerName,
                    cit.cardID,
                    cit.ct_quantity,
                    cit.item_price,
                    cit.is_foil
                FROM Transaction t 
                JOIN Players_In_Transactions pit ON pit.transaction_time = t.transaction_time
                JOIN Cards_In_Transactions cit ON cit.transaction_time = t.transaction_time
                WHERE pit.buyerName = ? OR pit.sellerName = ?
                ORDER BY t.transaction_time DESC`,
            [username, username]
        );
        return res.status(200).json({
            success: true,
            transactions: rows
        });

    } catch (error: any) {
        console.error("Error fetching transactions:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error",
            details: error.message
        });
    }
});

export default router;