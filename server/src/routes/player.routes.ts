import express from "express";
import pool from "../data/db.ts";
import jwt from "jsonwebtoken";
// import { authenticateToken } from "../middleware/authenticateToken.ts";

const router = express.Router();
const SECRET_KEY = 'mySecretKey';

router.post("/player", async (req, res) => {
    try {
      const { display_name, password } = req.body;
      await pool.query(
        "INSERT INTO Player (display_name, password) VALUES (?, ?)",
        [display_name, password]
      );

      res.status(201).json({ display_name, password });
    } catch (error) {
      res.status(500).json({ error: "Display name already exists" });
    }
});

router.post("/login", async (req, res) => {
  try {
    const { display_name, password } = req.body;
    const [players]: any = await pool.query(
      "SELECT * from Player WHERE display_name = ?",
      [display_name]
    );

    if (players.length === 0) {
      return res.status(401).json({ message: 'Invalid display name', field: 'display_name' });
    }
    else if (players[0].password !== password) {
      return res.status(401).json({ message: 'Invalid password', field: 'password' });
    }

    const token = jwt.sign({ display_name: players[0].display_name }, SECRET_KEY, { expiresIn: '2h' });

    res.json({ token, player: { display_name: players[0].display_name }});
  } catch (error) {
    res.status(500).json({ error: "Failed to login player" });
  }
});

export default router;
