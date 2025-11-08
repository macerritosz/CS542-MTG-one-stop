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

    res.status(201).json({ title, format, is_private, deckID: result.insertId });
  } catch (error) {
    // TODO: only care for title uniqueness relative to whether public or private
    res.status(500).json({ error: "Title already exists already exists" });
  }
});

router.post("/savedeck", async (req, res) => {
  try {
    const { deckID, name } = req.body;
    
    await pool.query(
      "INSERT INTO Players_Save_Decks (display_name, deckID ) VALUES (?, ?)",
      [name, deckID ]
    );

    res.status(201).json({ message: "Deck saved!!" });
  } catch (error) {
    res.status(500).json({ error: "Error in saving deck" });
  }
});

router.post("/removesavedeck", async (req, res) => {
  try {
    const { deckID, name } = req.body;
    
    await pool.query(
      "DELETE FROM Players_Save_Decks WHERE display_name = ? and deckID = ?",
      [name, deckID ]
    );

    res.status(201).json({ message: "Removed save from deck!!" });
  } catch (error) {
    res.status(500).json({ error: "Error in unsaving deck" });
  }
});

router.get("/saveddecks", async (req, res) => {
  try {
    const { name } = req.query;
    
    const [result]: any = await pool.query(
      "SELECT deckID FROM Players_Save_Decks WHERE display_name = ?",
      [name ]
    );

    res.status(201).json({ savedDecks: result });
  } catch (error) {
    res.status(500).json({ error: "Error in unsaving deck" });
  }
});

router.post("/decks/card", async (req, res) => {
  try {
    const { cardID, deckID } = req.body;
    
    const [duplicate]: any = await pool.query(
      "SELECT quantity FROM Cards_In_Decks WHERE deckID = ? AND cardID = ?",
      [deckID, cardID]
    );
  
    if(duplicate && duplicate.length > 0) {
      const new_quantity = duplicate[0].quantity + 1
      await pool.query(
        "UPDATE Cards_In_Decks SET quantity = ? WHERE deckID = ? AND cardID =?",
        [new_quantity, deckID, cardID]
      );
    } else {
      await pool.query(
        "INSERT INTO Cards_In_Decks (deckID, cardID ) VALUES (?, ?)",
        [deckID, cardID]
      );
    }

    res.status(201).json({ message: `Added card to deck ${deckID}` });

  } catch (error) {
    res.status(500).json({ error: "Card already exists in deck" });
  }
});

router.get("/decks/info", async (req, res) => {
  try {
    const { deckID } = req.query;

    const [deck]: any = await pool.query(
      "SELECT title, format FROM Deck WHERE deckID = ?",
      [deckID]
    );
    
    const [cards]: any = await pool.query(
      "SELECT cardID FROM Cards_In_Decks WHERE deckID = ?",
      [deckID] 
    );

    const cardIDs = cards.map((card: any) => card.cardID);

    if (cardIDs.length === 0) {
      return res.status(201).json({ title: deck[0].title, format: deck[0].format });
    }

    const placeholders = cardIDs.map(() => '?').join(',');

    const [card_info]: any = await pool.query(
      `SELECT image_uris, cardID FROM Card WHERE cardID IN (${placeholders}) LIMIT 8`,
      cardIDs
    );

    res.status(200).json({ card_info, title: deck[0].title, format: deck[0].format});
  } catch (error) {
    res.status(500).json({ error: "Failed to get cards in deck" });
  }
});

router.get("/decks/me", async (req, res) => {
  try {
    const { name } = req.query;

    const [idsBuilt]: any = await pool.query(
      "SELECT deckID FROM Players_Build_Decks WHERE display_name = ?",
      [name] 
    );

    const deckIDsBuilt = idsBuilt.map((deck: any) => deck.deckID);
    let decksBuilt: any = []

    if (deckIDsBuilt.length !== 0) {
      const placeholders = deckIDsBuilt.map(() => '?').join(',');
      [decksBuilt] = await pool.query(
        `SELECT deckID, title FROM Deck WHERE deckID IN (${placeholders}) LIMIT 8`,
        deckIDsBuilt
      );

      decksBuilt = await Promise.all(
        decksBuilt.map(async (deck: any) => {
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
    }

    const [idsSaved]: any = await pool.query(
      "SELECT deckID FROM Players_Save_Decks WHERE display_name = ?",
      [name] 
    );

    const deckIDsSaved = idsSaved.map((deck: any) => deck.deckID);
    let decksSaved: any = []

    if (deckIDsSaved.length !== 0) {
      const placeholders = deckIDsSaved.map(() => '?').join(',');
      [decksSaved] = await pool.query(
        `SELECT deckID, title FROM Deck WHERE deckID IN (${placeholders})`,
        deckIDsSaved
      );

      decksSaved= await Promise.all(
        decksSaved.map(async (deck: any) => {
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
    }
  
    res.status(200).json({decksBuilt, decksSaved});
  } catch (error) {
    res.status(500).json({ error: "Failed to get decks" });
  }
});

router.get("/decks", async (req, res) => {
  try {
    const { query, name } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20
    const offset = (page - 1) * limit;

    const conditions: string[] = ["title LIKE ?"];
    const params: any[] = [`%${query}%`];

    if (name) {
      conditions.push("deckID IN (SELECT deckID FROM Players_Build_Decks WHERE display_name = ?)");
      params.push(name);
    }

    const whereClause = "WHERE " + conditions.join(" AND ");

    const decksQuery = `SELECT * FROM Deck ${whereClause} LIMIT ? OFFSET ?`;
    const countQuery = `SELECT COUNT(*) as total FROM Deck ${whereClause}`;

    const decksParams = [...params, limit, offset];

     const [decks]: any = await pool.query(decksQuery, decksParams);

    const [[{ total }]]: any = await pool.query(countQuery, params);

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

    res.status(200).json({ page, total, totalPages: Math.ceil(total / limit), decks: decksWithCards });
  } catch (error) {
    res.status(500).json({ error: "Failed to get decks" });
  }
});

export default router;
