import express from "express";
import pool from "../data/db.ts";

const router = express.Router();

const queries = {
  playersDecksBuilt: `
    SELECT 
      pbd.display_name AS display_name,
      COUNT(DISTINCT pbd.deckID) AS total_decks_built,
      COUNT(DISTINCT CASE WHEN d.is_private = 0 THEN d.deckID END) AS public_decks,
      COUNT(DISTINCT CASE WHEN d.is_private = 1 THEN d.deckID END) AS private_decks,
      MAX(d.created_at) AS most_recent_deck
    FROM Players_Build_Decks pbd
    JOIN Deck d ON pbd.deckID = d.deckID
    GROUP BY pbd.display_name
    ORDER BY total_decks_built DESC, most_recent_deck DESC
    LIMIT ?
  `,
  playersPopularBuilders: `
    SELECT 
      pbd.display_name AS display_name,
      COUNT(DISTINCT pbd.deckID) AS decks_built,
      COUNT(DISTINCT psd.deckID) AS total_saves_received,
      COUNT(DISTINCT psd.display_name) AS unique_savers,
      ROUND(COUNT(DISTINCT psd.deckID) / NULLIF(COUNT(DISTINCT pbd.deckID), 0), 2) AS avg_saves_per_deck
    FROM Players_Build_Decks pbd
    LEFT JOIN Deck d ON pbd.deckID = d.deckID AND d.is_private = 0
    LEFT JOIN Players_Save_Decks psd ON d.deckID = psd.deckID
    GROUP BY pbd.display_name
    HAVING decks_built > 0
    ORDER BY total_saves_received DESC, avg_saves_per_deck DESC
    LIMIT ?
  `,
  cardsMostUsed: `
    SELECT 
      c.cardID,
      c.name,
      c.rarity,
      c.mv AS mana_value,
      c.price_usd,
      COUNT(DISTINCT cid.deckID) AS decks_using_card,
      SUM(cid.quantity) AS total_quantity_in_decks,
      AVG(cid.quantity) AS avg_quantity_per_deck,
      MAX(cid.quantity) AS max_quantity_in_single_deck
    FROM Card c
    JOIN Cards_In_Decks cid ON c.cardID = cid.cardID
    GROUP BY c.cardID, c.name, c.rarity, c.mv, c.price_usd
    HAVING decks_using_card > 0
    ORDER BY decks_using_card DESC, total_quantity_in_decks DESC
    LIMIT ?
  `,
  cardsMostExpensive: `
    SELECT 
      cardID,
      name,
      rarity,
      mv AS mana_value,
      price_usd,
      price_foil_usd,
      set_name,
      image_uris
    FROM Card
    WHERE price_usd IS NOT NULL
    ORDER BY price_usd DESC
    LIMIT ?
  `,
  decksMostSaved: `
    SELECT 
      d.deckID,
      d.title,
      d.format,
      d.created_at,
      pbd.display_name AS builder_name,
      COUNT(DISTINCT psd.deckID) AS total_saves,
      COUNT(DISTINCT psd.display_name) AS unique_savers,
      (SELECT COUNT(*) FROM Cards_In_Decks WHERE deckID = d.deckID) AS total_cards
    FROM Deck d
    JOIN Players_Save_Decks psd ON d.deckID = psd.deckID
    LEFT JOIN Players_Build_Decks pbd ON d.deckID = pbd.deckID
    WHERE d.is_private = 0
    GROUP BY d.deckID, d.title, d.format, d.created_at, builder_name
    ORDER BY total_saves DESC, unique_savers DESC
    LIMIT ?
  `,
};

router.get("/leaderboards", async (req, res) => {
  try {
    const limitParam = Number(req.query.limit);
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 50) : 10;

    const [
      [playersDecksBuilt],
      [playersPopularBuilders],
      [cardsMostUsed],
      [cardsMostExpensive],
      [decksMostSaved],
    ] = await Promise.all([
      pool.query(queries.playersDecksBuilt, [limit]),
      pool.query(queries.playersPopularBuilders, [limit]),
      pool.query(queries.cardsMostUsed, [limit]),
      pool.query(queries.cardsMostExpensive, [limit]),
      pool.query(queries.decksMostSaved, [limit]),
    ]);

    res.status(200).json({
      playersDecksBuilt,
      playersPopularBuilders,
      cardsMostUsed,
      cardsMostExpensive,
      decksMostSaved,
    });
  } catch (error) {
    console.error("Failed to fetch leaderboards", error);
    res.status(500).json({ error: "Failed to fetch leaderboards" });
  }
});

export default router;

