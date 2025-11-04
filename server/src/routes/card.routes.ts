import express from "express";
import pool from "../data/db.ts";

const router = express.Router();

router.get("/cards", async (req, res) => {
  try {
    const { query } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 40
    const offset = (page - 1) * limit;

    const [cards]: any = await pool.query(
      "SELECT image_uris, cardID FROM Card WHERE name LIKE ? LIMIT ? OFFSET ?",
      [`%${query}%`, limit, offset] 
    );

    const [[{ total }]]: any = await pool.query(
      "SELECT COUNT(*) as total FROM Card WHERE name LIKE ?",
      [`%${query}%`]
    );

    res.status(200).json({ page, total, totalPages: Math.ceil(total / limit), cards });
  } catch (error) {
    res.status(500).json({ error: "Failed to get cards" });
  }
});

export default router;
