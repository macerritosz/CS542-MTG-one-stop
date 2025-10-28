import express from "express";
import pool from "../data/db.ts";

const router = express.Router();

router.get("/decks", async (req, res) => {
  try {
    const { query } = req.query;
    const [decks]: any = await pool.query(
      "SELECT * FROM Deck WHERE title LIKE ?",
      [`%${query}%`] 
    );
    res.status(200).json(decks);
  } catch (error) {
    res.status(500).json({ error: "Failed to get decks" });
  }
});

export default router;
