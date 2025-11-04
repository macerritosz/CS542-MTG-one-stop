import express from "express";
import pool from "../data/db.ts";
import { type ResultSetHeader } from "mysql2";

const router = express.Router();

router.post("/decks", async (req, res) => {
  try {
    const { title, format, is_private, name } = req.body;
    const [ result ] = await pool.query(
      "INSERT INTO Deck (title, format, is_private ) VALUES (?, ?, ?)",
      [title, format, is_private]
    ) as [ResultSetHeader, any];
    
    await pool.query(
      "INSERT INTO Players_Build_Decks (display_name, deckID ) VALUES (?, ?)",
      [name, result.insertId ]
    );

    res.status(201).json({ title, format, is_private });
  } catch (error) {
    // only care for title uniqueness relative to whether public or private
    res.status(500).json({ error: "Title already exists already exists" });
  }
});

// get id of deck with specific title, maybe 
router.post("/decks/card", async (req, res) => {
  try {
    const { cardID, deckID, quantity } = req.body;
    await pool.query(
      "INSERT INTO Cards_In_Decks (deckID, cardID, quantity ) VALUES (?, ?, ?)",
      [deckID, cardID, quantity]
    );
    res.status(201).json({ message: `Added card to deck ${deckID}` });

  } catch (error) {
    res.status(500).json({ error: "Card already exists in deck" });
  }
});


router.get("/decks/me", async (req, res) => {
  try {
    const { name } = req.query;

    const [ids]: any = await pool.query(
      "SELECT deckID FROM Players_Build_Decks WHERE display_name = ?",
      [name] 
    );

    const deckIDs = ids.map((deck: any) => deck.deckID);

    if (deckIDs.length === 0) {
      return res.status(404).json({ error: "No decks found" });
    }

    const placeholders = deckIDs.map(() => '?').join(',');
    const [decks]: any = await pool.query(
      `SELECT deckID, title FROM Deck WHERE deckID IN (${placeholders})`,
      deckIDs
    );
    // concatenate players saved decks i assume
  
    res.status(200).json({decks});
  } catch (error) {
    res.status(500).json({ error: "Failed to get decks" });
  }
});

router.get("/decks/info", async (req, res) => {
  try {
    const { deckID } = req.query;

    const [cards]: any = await pool.query(
      "SELECT cardID FROM Cards_In_Decks WHERE deckID = ?",
      [deckID] 
    );

    const cardIDs = cards.map((card: any) => card.cardID);

    if (cardIDs.length === 0) {
      return res.status(404).json({ error: "No cards found in deck" });
    }

    const placeholders = cardIDs.map(() => '?').join(',');

    const [card_info]: any = await pool.query(
      `SELECT image_uris, cardID FROM Card WHERE cardID IN (${placeholders})`,
      cardIDs
    );

    res.status(200).json({ card_info });
  } catch (error) {
    res.status(500).json({ error: "Failed to get cards in deck" });
  }
});

router.get("/decks", async (req, res) => {
  try {
    const { query } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 40
    const offset = (page - 1) * limit;

    const [decks]: any = await pool.query(
      "SELECT * FROM Deck WHERE title LIKE ? LIMIT ? OFFSET ?",
      [`%${query}%`, limit, offset] 
    );

    const [[{ total }]]: any = await pool.query(
      "SELECT COUNT(*) as total FROM Deck WHERE title LIKE ?",
      [`%${query}%`]
    );

    res.status(200).json({ page, total, totalPages: Math.ceil(total / limit), decks });
  } catch (error) {
    res.status(500).json({ error: "Failed to get decks" });
  }
});

export default router;
