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


router.post("/publishdeck", async (req, res) => {
  try {
    const { deckID } = req.body;

    const [result]: any = await pool.query(
      "SELECT cardID, quantity FROM Cards_In_Decks WHERE deckID = ?",
      [deckID]
    );
    const total = result.reduce((sum: number, row: any) => sum + row.quantity, 0);

    const [deck]: any = await pool.query(
      "SELECT format FROM Deck WHERE deckID = ?",
      [deckID]
    );

    if (deck[0].format.toLowerCase() === 'commander' && total < 100) {
      return res.status(400).json({ message: `${deck[0].format.toLowerCase()} requires ${100} cards to publish`});
    } else if (deck[0].format.toLowerCase() !== 'commander' && total < 60) {
      return res.status(400).json({ message: `${deck[0].format.toLowerCase()} requires ${60} cards to publish`});
    }

    await pool.query(
      "UPDATE Deck SET is_private = 0 WHERE deckID = ?",
      [deckID]
    );
    
    res.status(201).json({ message: "Deck published!" });
  } catch (error) {
    res.status(500).json({ error: "Error in publishing deck" });
  }
});

router.post("/unpublishdeck", async (req, res) => {
  try {
    const { deckID } = req.body;

    await pool.query(
      "UPDATE Deck SET is_private = 1 WHERE deckID = ?",
      [deckID]
    );
    
    res.status(201).json({ message: "Deck unpublished!" });
  } catch (error) {
    res.status(500).json({ error: "Error in unpublishing deck" });
  }
});

router.post("/decks/card", async (req, res) => {
  try {
    const { cardID, deckID, quantity = 1 } = req.body;
    
    const [duplicate]: any = await pool.query(
      "SELECT * FROM Cards_In_Decks WHERE deckID = ? AND cardID = ?",
      [deckID, cardID]
    );
  
    if(duplicate && duplicate.length > 0) {
      const new_quantity = duplicate[0].quantity + quantity;
      const [result]: any = await pool.query(
        "UPDATE Cards_In_Decks SET quantity = ? WHERE deckID = ? AND cardID = ?",
        [new_quantity, deckID, cardID]
      );
      console.log(result)
    } else {
      await pool.query(
        "INSERT INTO Cards_In_Decks (deckID, cardID, quantity) VALUES (?, ?, ?)",
        [deckID, cardID, quantity]
      );
    }

    res.status(201).json({ message: `Added card to deck ${deckID}` });

  } catch (error) {
    res.status(500).json({ error: "Card already exists in deck" });
  }
});

router.post("/removecard", async (req, res) => {
  try {
    const { deckID, cardID, quantity = 1 } = req.body

    const [entry]: any = await pool.query(
      "SELECT quantity FROM Cards_In_Decks WHERE deckID = ? AND cardID = ?",
      [deckID, cardID]
    );

    if(entry && entry.length > 0 && entry[0].quantity > 1) {
      const new_quantity = entry[0].quantity - quantity;
      await pool.query(
        "UPDATE Cards_In_Decks SET quantity = ? WHERE deckID = ? AND cardID = ?",
        [new_quantity, deckID, cardID]
      );
    } else {
      await pool.query(
        "DELETE FROM Cards_In_Decks WHERE deckID = ? and cardID = ?",
        [deckID, cardID]
      );
    }

    res.status(201).json({ message: `Removed card from deck ${deckID}` });
  } catch (error) {
    res.status(500).json({ error: "Error in unsaving deck" });
  }
});

router.post("/deletedeck", async (req, res) => {
  try {
    const { deckID } = req.body

    await pool.query(
      "DELETE FROM Deck WHERE deckID = ?",
      [deckID]
    );

    res.status(201).json({ message: `Deck ${deckID} deleted.` });
  } catch (error) {
    res.status(500).json({ error: "Error in unsaving deck" });
  }
});

router.get("/decks/info", async (req, res) => {
  try {
    const { deckID } = req.query;

    const [[deck]]: any = await pool.query(
      "SELECT title, format, is_private, created_at FROM Deck WHERE deckID = ?",
      [deckID]
    );

    const [[builder_name]]: any = await pool.query(
      "SELECT display_name FROM Players_Build_Decks WHERE deckID = ?",
      [deckID]
    );

    if (!deck) {
      return res.status(404).json({ error: "Deck not found" });
    }
    
    const [cards]: any = await pool.query(
      "SELECT cardID, quantity FROM Cards_In_Decks WHERE deckID = ?",
      [deckID] 
    );

    const cardIDs = cards.map((card: any) => card.cardID);

    if (cardIDs.length === 0) {
      return res.status(201).json({ builder_name, title: deck.title, created_at: deck.created_at, format: deck.format, is_private: deck.is_private, card_info: [], color_distribution: [] });
    }

    const placeholders = cardIDs.map(() => '?').join(',');

    const [card_info]: any = await pool.query(
      `SELECT image_uris, cardID, name, purchase_uris, scryfall_uri FROM Card WHERE cardID IN (${placeholders})`,
      cardIDs
    );

    const merged = card_info.map((info: any) => {
      const match = cards.find((c: any) => c.cardID === info.cardID);
      return {
        ...info,
        quantity: match ? match.quantity : 0
      };
    });

    const [colorCounts]: any = await pool.query(
      `SELECT c.colorName, SUM(cid.quantity) as count
       FROM Colors c
       JOIN Color_Identity ci ON c.colorID = ci.colorID
       JOIN Cards_In_Decks cid ON ci.cardID = cid.cardID
       WHERE cid.deckID = ?
       GROUP BY c.colorID, c.colorName`,
      [deckID]
    );

    const totalCards = cards.reduce((sum: number, card: any) => sum + card.quantity, 0);
    
    const color_distribution = colorCounts.map((color: any) => ({
      colorName: color.colorName,
      count: Number(color.count),
      percentage: Math.round((color.count / totalCards) * 100)
    }));

    res.status(200).json({ builder_name, card_info: merged, title: deck.title, created_at: deck.created_at, format: deck.format, is_private: deck.is_private, color_distribution});
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

    const conditions: string[] = [];
    const params: any[] = [];

    if (query && typeof query === 'string' && query.trim() !== "") {
      conditions.push("d.title LIKE ?");
      params.push(`%${query}%`);
    }

    if (name) {
      conditions.push("pbd.display_name = ?");
      params.push(name);
    } else {
      conditions.push("d.is_private = 0");
    } 

    const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

    const decksQuery = `
      SELECT d.*, pbd.display_name
      FROM Deck d
      JOIN Players_Build_Decks pbd ON d.deckID = pbd.deckID
      ${whereClause}
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM Deck d
      JOIN Players_Build_Decks pbd ON d.deckID = pbd.deckID
      ${whereClause}
    `;

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
