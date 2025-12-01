import express from "express";
import pool from "../data/db.ts";

const router = express.Router();

router.get("/leaderboards", async (req, res) => {
  try {
    const limitParam = Number(req.query.limit);
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 50) : 10;

    // Query the database views directly
    const [
      [playersDecksBuilt],
      [playersPopularBuilders],
      [cardsMostUsed],
      [cardsMostExpensive],
      [decksMostSaved],
    ] = await Promise.all([
      pool.query(`SELECT * FROM vw_leaderboard_players_decks_built LIMIT ?`, [limit]),
      pool.query(`SELECT * FROM vw_leaderboard_players_popular_builders LIMIT ?`, [limit]),
      pool.query(`SELECT * FROM vw_leaderboard_cards_most_used LIMIT ?`, [limit]),
      pool.query(`SELECT * FROM vw_leaderboard_cards_most_expensive LIMIT ?`, [limit]),
      pool.query(`SELECT * FROM vw_leaderboard_decks_most_saved LIMIT ?`, [limit]),
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

