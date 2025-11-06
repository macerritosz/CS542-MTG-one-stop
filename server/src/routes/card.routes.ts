import express from "express";
import pool from "../data/db.ts";

const router = express.Router();

router.get("/cards", async (req, res) => {
  try {
    // Manually parse query string to handle multiple values for same parameter
    // Express doesn't parse ?colors=U&colors=B as an array by default
    // Extract just the query string from req.url (it might be just the path + query)
    const queryString = req.url?.includes('?') ? req.url.split('?')[1] : '';
    const url = new URL(`http://dummy.com?${queryString}`);
    const getAllParams = (paramName: string): string[] => {
      return url.searchParams.getAll(paramName).filter(Boolean);
    };
    
    const query = url.searchParams.get("query") || undefined;
    const rarity = getAllParams("rarity");
    const colors = getAllParams("colors");
    const colorIdentity = getAllParams("colorIdentity");
    const manaValueMin = url.searchParams.get("manaValueMin") || undefined;
    const manaValueMax = url.searchParams.get("manaValueMax") || undefined;
    const format = url.searchParams.get("format") || undefined;
    const priceMin = url.searchParams.get("priceMin") || undefined;
    const priceMax = url.searchParams.get("priceMax") || undefined;
    const set = url.searchParams.get("set") || undefined;
    const sortBy = url.searchParams.get("sortBy") || 'name';
    const sortOrder = (url.searchParams.get("sortOrder") as 'asc' | 'desc') || 'asc';
    
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = 40;
    const offset = (page - 1) * limit;

    // Build WHERE conditions
    const conditions: string[] = [];
    const params: any[] = [];

    // Name search
    if (query) {
      conditions.push("c.name LIKE ?");
      params.push(`%${query}%`);
    }

    // Rarity filter (OR logic - cards with ANY of the selected rarities)
    if (rarity.length > 0) {
      const rarityList = rarity.map(r => String(r)).filter(Boolean);
      if (rarityList.length > 0) {
        const placeholders = rarityList.map(() => '?').join(',');
        conditions.push(`c.rarity IN (${placeholders})`);
        params.push(...rarityList);
      }
    }

    // Colors filter (OR logic - cards that have ANY of the selected colors)
    // Example: Selecting Red and Blue finds cards that are Red OR Blue (or both)
    if (colors.length > 0) {
      const colorIds = colors.map((c) => {
        const colorStr = String(c);
        const colorMap: { [key: string]: number } = { 'W': 1, 'U': 2, 'B': 3, 'R': 4, 'G': 5, 'C': 6 };
        return colorMap[colorStr] || 0;
      }).filter(id => id > 0);
      
      if (colorIds.length > 0) {
        const placeholders = colorIds.map(() => '?').join(',');
        // EXISTS with IN means: card has ANY of these colors (OR logic)
        conditions.push(`EXISTS (
          SELECT 1 FROM Colors_To_Card ctc 
          WHERE ctc.cardID = c.cardID 
          AND ctc.colorID IN (${placeholders})
        )`);
        params.push(...colorIds);
      }
    }

    // Color Identity filter (OR logic - cards with ANY of the selected color identities)
    if (colorIdentity.length > 0) {
      const colorIds = colorIdentity.map((c) => {
        const colorStr = String(c);
        const colorMap: { [key: string]: number } = { 'W': 1, 'U': 2, 'B': 3, 'R': 4, 'G': 5, 'C': 6 };
        return colorMap[colorStr] || 0;
      }).filter(id => id > 0);
      
      if (colorIds.length > 0) {
        const placeholders = colorIds.map(() => '?').join(',');
        // EXISTS with IN means: card has ANY of these color identities (OR logic)
        conditions.push(`EXISTS (
          SELECT 1 FROM Color_Identity ci 
          WHERE ci.cardID = c.cardID 
          AND ci.colorID IN (${placeholders})
        )`);
        params.push(...colorIds);
      }
    }

    // Mana Value range
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

    // Format legality filter
    if (format && format !== '') {
      const formatName = String(format);
      // Validate format name to prevent SQL injection
      const validFormats = ['standard', 'future', 'historic', 'timeless', 'gladiator', 'pioneer', 'modern', 'legacy', 'pauper', 'vintage', 'penny', 'commander', 'oathbreaker', 'standardbrawl', 'brawl', 'alchemy', 'paupercommander', 'duel', 'oldschool', 'premodern', 'predh'];
      if (validFormats.includes(formatName.toLowerCase())) {
        conditions.push(`c.cardID IN (
          SELECT cardID FROM Legalities WHERE ${formatName.toLowerCase()} = 1
        )`);
      }
    }

    // Price range
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

    // Set filter
    if (set && set !== '') {
      conditions.push("c.set_name LIKE ?");
      params.push(`%${set}%`);
    }

    // Build WHERE clause
    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}` 
      : '';

    // Validate sortBy to prevent SQL injection
    const validSortFields: { [key: string]: string } = {
      'name': 'c.name',
      'price': 'c.price_usd',
      'mv': 'c.mv',
      'edhrec_rank': 'c.edhrec_rank',
      'released_at': 'c.released_at'
    };
    const sortField = validSortFields[sortBy as string] || 'c.name';
    const order = sortOrder === 'desc' ? 'DESC' : 'ASC';

    // Build query
    const cardsQuery = `
      SELECT DISTINCT c.image_uris, c.cardID 
      FROM Card c
      ${whereClause}
      ORDER BY ${sortField} ${order}
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(DISTINCT c.cardID) as total 
      FROM Card c
      ${whereClause}
    `;

    const cardsParams = [...params, limit, offset];
    const [cards]: any = await pool.query(cardsQuery, cardsParams);
    const [[{ total }]]: any = await pool.query(countQuery, params);
    
    // Debug logging (remove in production)
    console.log('URL query string:', url.search);
    console.log('Parsed colors array:', colors);
    console.log('Parsed colorIdentity array:', colorIdentity);
    console.log('Query params:', { query, rarity, colors, colorIdentity, manaValueMin, manaValueMax, format, priceMin, priceMax, set });
    console.log('Conditions:', conditions);
    console.log('SQL Params:', params);
    console.log('Results:', cards.length, 'cards found');
    
    // Debug: Check color data availability
    if (colors || colorIdentity) {
      // Check if any cards matching the name query have color data
      if (query) {
        const [colorTest]: any = await pool.query(
          `SELECT COUNT(DISTINCT c.cardID) as total_with_colors
           FROM Card c
           INNER JOIN Colors_To_Card ctc ON c.cardID = ctc.cardID
           WHERE c.name LIKE ?`,
          [`%${query}%`]
        );
        console.log(`Cards with '${query}' that have color data:`, colorTest[0]?.total_with_colors || 0);
      }
      
      // Check total cards with color data
      const [totalWithColors]: any = await pool.query(
        `SELECT COUNT(DISTINCT cardID) as total FROM Colors_To_Card`
      );
      console.log('Total cards with color data in database:', totalWithColors[0]?.total || 0);
    }

    res.status(200).json({ page, total, totalPages: Math.ceil(total / limit), cards });
  } catch (error) {
    console.error("Error fetching cards:", error);
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