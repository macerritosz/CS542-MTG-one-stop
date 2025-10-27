import express from "express";
import pool from "../data/db.ts";

const router = express.Router();

router.post("/transaction", async (req, res) => {
    try {
      const { display_name, email, password } = req.body;
      const [result]: any = await pool.query(
        "INSERT INTO Transaction (display_name,email, password) VALUES (?, ?, ?)",
        [display_name, email, password]
      );
      res.status(201).json({ id: result.insertId, display_name, email, password });
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
});

export default router;
