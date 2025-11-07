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

router.get("/cardnames", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) return res.status(200).json({ cards: [] });
    
    const [cards]: any = await pool.query(
      "SELECT DISTINCT name FROM Card WHERE name LIKE ? ORDER BY name LIMIT 4",
      [`%${query}%`]
    );

    res.status(200).json({ cards });
  } catch (error) {
    res.status(500).json({ error: "Failed to get card names" });
  }
});

router.get("/cardsindecks", async (req, res) => {
  try {
    const { cardID } = req.query;

    if (!cardID) return res.status(200).json({ message: 'Give me a card'});
    
    const [ids]: any = await pool.query(
      "SELECT deckID FROM Cards_In_Decks WHERE cardID = ?",
      [cardID]
    );

    const deckIDs = ids.map((deck: any) => deck.deckID);

    if (deckIDs.length === 0) {
      return res.status(201).json({ decks: [] });
    }

    const placeholders = deckIDs.map(() => '?').join(',');
    const [decks]: any = await pool.query(
      `SELECT * FROM Deck WHERE deckID in (${placeholders}) LIMIT 3`,
      deckIDs
    );

    const decksWithCards = await Promise.all(
      decks.map(async (deck: any) => {
        const [cards]: any = await pool.query(
          `SELECT c.cardID, c.image_uris
           FROM Cards_In_Decks cid
           JOIN Card c ON cid.cardID = c.cardID
           WHERE cid.deckID = ?
           LIMIT 4`,
          [deck.deckID]
        );
        return {
          ...deck,
          cards, 
        };
      })
    );


    res.status(200).json({ decks: decksWithCards});
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/cardid", async (req, res) => {
  try {
    const { name } = req.query;

    if(!name) return res.status(200).json({message: 'No name'});
  
    const [id]: any = await pool.query(
    "SELECT cardID from Card WHERE name = ?",
      [name]
    );

    res.status(200).json({ id: id[0]});
  } catch (error) {
    res.status(500).json({ error: "Failed to get card id" });
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
