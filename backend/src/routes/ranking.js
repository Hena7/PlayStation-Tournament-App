import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import db from "../config/db.js";

const router = express.Router();

// GET route to fetch all rankings
router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM rankings");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching rankings:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
