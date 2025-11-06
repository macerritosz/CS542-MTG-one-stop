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

router.get("/card/info", async (req, res) => {
  try {
    const { cardID } = req.query;

    const [card]: any = await pool.query(
      "SELECT * FROM Card WHERE cardID = ?",
      [cardID] 
    );

    const [legalities]: any = await pool.query(
      "SELECT * FROM Legalities WHERE cardID = ?",
      [cardID] 
    );

    const [keywords]: any = await pool.query(
      "SELECT keyword FROM Keywords NATURAL JOIN Keywords_To_Card WHERE cardID = ?",
      [cardID]
    );

    const [produced_mana]: any = await pool.query(
      "SELECT colorChar FROM Colors NATURAL JOIN Produced_Mana WHERE cardID = ?",
      [cardID]
    );

    const [color_identity]: any = await pool.query(
      "SELECT colorChar FROM Colors NATURAL JOIN Color_Identity WHERE cardID = ?",
      [cardID]
    );

    res.status(200).json({ card: card[0], legalities: legalities[0], keywords, produced_mana, color_identity });
  } catch (error) {
    res.status(500).json({ error: "Failed to get card" });
  }
});

export default router;

/*

SELECT keyword
FROM Keywords NATURAL JOIN Keywords_To_Card
WHERE cardID = ?
*/