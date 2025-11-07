import express from "express";
import pool from "../data/db.ts";

const router = express.Router();

router.get("/cards", async (req, res) => {
  try {
    const queryString = req.url?.includes('?') ? req.url.split('?')[1] : '';
    const url = new URL(`http://dummy.com?${queryString}`);

    const getAllParams = (paramName: string): string[] => {
      return url.searchParams.getAll(paramName).filter(Boolean);
    };
    
    const query = url.searchParams.get("query");
    const rarity = getAllParams("rarity");
    const colors = getAllParams("colors");
    const colorIdentity = getAllParams("colorIdentity");
    const manaValueMin = url.searchParams.get("manaValueMin");
    const manaValueMax = url.searchParams.get("manaValueMax");
    const format = url.searchParams.get("format");
    const priceMin = url.searchParams.get("priceMin");
    const priceMax = url.searchParams.get("priceMax");
    const sortBy = url.searchParams.get("sortBy") || "name";
    const sortOrder = url.searchParams.get("sortOrder") || "asc";
    
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = 20;

    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];

    if (query) {
      conditions.push("c.name LIKE ?");
      params.push(`%${query}%`);
    }

    if (rarity.length > 0) {
      const rarityList = rarity.map(r => String(r)).filter(Boolean);
      if (rarityList.length > 0) {
        const placeholders = rarityList.map(() => '?').join(',');
        conditions.push(`c.rarity IN (${placeholders})`);
        params.push(...rarityList);
      }
    }

    if (colors.length > 0) {
        const colorIds = colors.map((c) => {
            const colorStr = String(c);
            const colorMap: { [key: string]: number } = { 'W': 1, 'U': 2, 'B': 3, 'R': 4, 'G': 5, 'C': 6 };
            return colorMap[colorStr] || 0;
        }).filter(id => id > 0);
        
        if (colorIds.length > 0) {
            const colorLogic = url.searchParams.get("colorLogic") || "OR";
            const placeholders = colorIds.map(() => '?').join(',');
            
            if (colorLogic === 'AND') {
                conditions.push(`(
                    SELECT COUNT(DISTINCT ctc.colorID) 
                    FROM Colors_To_Card ctc 
                    WHERE ctc.cardID = c.cardID 
                    AND ctc.colorID IN (${placeholders})
                ) >= ?`);
                params.push(...colorIds, colorIds.length);
            } else {
                conditions.push(`EXISTS (
                    SELECT 1 FROM Colors_To_Card ctc 
                    WHERE ctc.cardID = c.cardID 
                    AND ctc.colorID IN (${placeholders})
                )`);
                params.push(...colorIds);
            }
        }
    }

    if (colorIdentity.length > 0) {
        const colorIds = colorIdentity.map((c) => {
            const colorStr = String(c);
            const colorMap: { [key: string]: number } = { 'W': 1, 'U': 2, 'B': 3, 'R': 4, 'G': 5, 'C': 6 };
            return colorMap[colorStr] || 0;
        }).filter(id => id > 0);
        
        if (colorIds.length > 0) {
            const colorIdentityLogic = url.searchParams.get("colorIdentityLogic") || "OR";
            const placeholders = colorIds.map(() => '?').join(',');
            
            if (colorIdentityLogic === 'AND') {
                conditions.push(`(
                    SELECT COUNT(DISTINCT ci.colorID) 
                    FROM Color_Identity ci 
                    WHERE ci.cardID = c.cardID 
                    AND ci.colorID IN (${placeholders})
                ) >= ?`);
                params.push(...colorIds, colorIds.length);
            } else {
                conditions.push(`EXISTS (
                    SELECT 1 FROM Color_Identity ci 
                    WHERE ci.cardID = c.cardID 
                    AND ci.colorID IN (${placeholders})
                )`);
                params.push(...colorIds);
            }
        }
    }

    if (manaValueMin && manaValueMin !== '') {
      const minVal = parseInt(manaValueMin as string);
      if (!isNaN(minVal)) {
        conditions.push("c.mv >= ?");
        params.push(minVal);
      }
    }

    if (manaValueMax && manaValueMax !== '') {
      const maxVal = parseInt(manaValueMax as string);
      if (!isNaN(maxVal)) {
        conditions.push("c.mv <= ?");
        params.push(maxVal);
      }
    }

    if (format && format !== '') conditions.push(`c.cardID IN (SELECT cardID FROM Legalities WHERE ${String(format).toLowerCase()} = 1)`);
    
    if (priceMin && priceMin !== '') {
      const minPrice = parseFloat(priceMin as string);
      if (!isNaN(minPrice)) {
        conditions.push("c.price_usd >= ?");
        params.push(minPrice);
      }
    }

    if (priceMax && priceMax !== '') {
      const maxPrice = parseFloat(priceMax as string);
      if (!isNaN(maxPrice)) {
        conditions.push("c.price_usd <= ?");
        params.push(maxPrice);
      }
    }
    const orderClause = `ORDER BY c.${sortBy} ${sortOrder}`;
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const cardsQuery = `
        SELECT 
            ANY_VALUE(c.image_uris) AS image_uris,
            MIN(c.cardID) AS cardID,
            c.name
        FROM Card c
        ${whereClause}
        GROUP BY c.name
        ${orderClause}
        LIMIT ? OFFSET ?
    `;
    
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM (
          SELECT c.name
          FROM Card c
          ${whereClause}
          GROUP BY c.name
      ) AS unique_cards
  `;
    const cardsParams = [...params, limit, offset];
    const [cards]: any = await pool.query(cardsQuery, cardsParams);
    const [[{ total }]]: any = await pool.query(countQuery, params);
    
    res.status(200).json({ page, total, totalPages: Math.ceil(total / limit), cards });
  } catch (error) {
    res.status(500).json({ error: "Failed to get cards" });
  }
});

router.get("/cardssimple", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) return res.status(200).json({ cards: [] });
    
    const [cards]: any = await pool.query(
      "SELECT cardID FROM Card WHERE name LIKE ?",
      [`%${query}%`]
    );

    res.status(200).json({ cards });
  } catch (error) {
    res.status(500).json({ error: "Failed to get card names" });
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
