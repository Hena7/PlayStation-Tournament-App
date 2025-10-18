import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import db from "../config/db.js";

const router = express.Router();

// GET route to fetch user matches
router.get("/matches", authMiddleware, async (req, res) => {
  try {
    // Assuming you want to fetch matches for the logged-in user
    const userId = req.user.id;
    const result = await db.query(
      "SELECT * FROM matches WHERE player1_id = $1 OR player2_id = $1",
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching user matches:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
