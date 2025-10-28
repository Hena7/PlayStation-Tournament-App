import express from "express";
import prisma from "../config/db.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const router = express.Router();

// POST ranking (admin only)
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

// GET user rankings (authenticated)
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

// GET public leaderboard (no auth required)
router.get("/leaderboard", async (req, res) => {
  try {
    // Find the latest tournament with at least one ranking
    const latestTournamentWithRankings = await prisma.tournament.findFirst({
      where: {
        rankings: {
          some: {},
        },
      },
      orderBy: { id: "desc" },
      select: { id: true },
    });

    if (!latestTournamentWithRankings) {
      return res.json([]);
    }

    // Get rankings for the latest tournament with user details
    const rankings = await prisma.ranking.findMany({
      where: { tournament_id: latestTournamentWithRankings.id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profile_photo_url: true,
            gamesPlayed: true,
            wins: true,
            losses: true,
          },
        },
      },
      orderBy: { rank: "asc" },
    });

    // Map to leaderboard format
    const leaderboard = rankings.map((ranking) => {
      const user = ranking.user;
      const rankScore = user.wins * 3 + user.gamesPlayed * 0.5;
      const winRate =
        user.gamesPlayed > 0
          ? ((user.wins / user.gamesPlayed) * 100).toFixed(1) + "%"
          : "0%";
      return {
        id: user.id,
        username: user.username,
        profile_photo_url: user.profile_photo_url,
        gamesPlayed: user.gamesPlayed,
        wins: user.wins,
        losses: user.losses,
        winRate,
        rankScore: rankScore.toFixed(1),
        rank: ranking.rank,
      };
    });

    res.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ message: error.message });
  }
});

// POST update user stats (admin only - for tournament results)
router.post(
  "/update-stats",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    const { user_id, result } = req.body; // result: 'win' or 'loss'
    try {
      const user = await prisma.user.findUnique({
        where: { id: user_id },
        select: { gamesPlayed: true, wins: true, losses: true },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const updateData = {
        gamesPlayed: user.gamesPlayed + 1,
      };

      if (result === "win") {
        updateData.wins = user.wins + 1;
      } else if (result === "loss") {
        updateData.losses = user.losses + 1;
      }

      const updatedUser = await prisma.user.update({
        where: { id: user_id },
        data: updateData,
        select: {
          id: true,
          username: true,
          gamesPlayed: true,
          wins: true,
          losses: true,
        },
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user stats:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
