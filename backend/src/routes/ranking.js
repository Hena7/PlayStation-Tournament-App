import express from "express";
import pool from "../config/db.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  const { user_id, tournament_id, rank } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO rankings (user_id, tournament_id, rank) VALUES ($1, $2, $3) RETURNING *",
      [user_id, tournament_id, rank]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error posting ranking:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT r.*, u.username, t.name as tournament_name " +
        "FROM rankings r " +
        "JOIN users u ON r.user_id = u.id " +
        "JOIN tournaments t ON r.tournament_id = t.id " +
        "WHERE r.user_id = $1 " +
        "ORDER BY r.rank",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching rankings:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
