import express from "express";
import prisma from "../config/db.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  const { user_id, tournament_id, rank } = req.body;
  try {
    const ranking = await prisma.ranking.create({
      data: {
        user_id: user_id,
        tournament_id: tournament_id,
        rank: rank,
      },
    });
    res.json(ranking);
  } catch (error) {
    console.error("Error posting ranking:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const rankings = await prisma.ranking.findMany({
      where: { user_id: req.user.id },
      include: {
        user: {
          select: { username: true },
        },
        tournament: {
          select: { name: true },
        },
      },
      orderBy: { rank: "asc" },
    });
    const formattedRankings = rankings.map((ranking) => ({
      ...ranking,
      username: ranking.user.username,
      tournament_name: ranking.tournament.name,
    }));
    res.json(formattedRankings);
  } catch (error) {
    console.error("Error fetching rankings:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
