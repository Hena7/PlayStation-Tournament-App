import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import prisma from "../config/db.js";

const router = express.Router();

// GET route to fetch user matches
router.get("/matches", authMiddleware, async (req, res) => {
  try {
    // Assuming you want to fetch matches for the logged-in user
    const userId = req.user.id;
    const matches = await prisma.match.findMany({
      where: {
        OR: [{ player1_id: userId }, { player2_id: userId }],
      },
    });
    res.json(matches);
  } catch (error) {
    console.error("Error fetching user matches:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
