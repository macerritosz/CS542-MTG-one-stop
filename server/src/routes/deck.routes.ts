import express from "express";
import pool from "../data/db.ts";

const router = express.Router();

router.get("/decks", async (req, res) => {
  try {
    const { query } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 40
    const offset = (page - 1) * limit;

    const [decks]: any = await pool.query(
      "SELECT * FROM Deck WHERE name LIKE ? LIMIT ? OFFSET ?",
      [`%${query}%`, limit, offset] 
    );

    const [[{ total }]]: any = await pool.query(
      "SELECT COUNT(*) as total FROM Deck WHERE name LIKE ?",
      [`%${query}%`]
    );

    res.status(200).json({ page, total, totalPages: Math.ceil(total / limit), decks });
  } catch (error) {
    res.status(500).json({ error: "Failed to get decks" });
  }
});

export default router;
