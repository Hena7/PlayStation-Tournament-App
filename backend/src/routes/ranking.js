import express from "express";
import prisma from "../config/db.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const router = express.Router();

// POST ranking (admin only)
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  const { user_id, tournament_id, rank } = req.body;
  try {
    // Prevent duplicate rankings for the same user/tournament. If a ranking
    // already exists for this (user_id, tournament_id) pair, update it; otherwise create.
    const existing = await prisma.ranking.findFirst({
      where: { user_id: user_id, tournament_id: tournament_id },
    });
    let ranking;
    if (existing) {
      ranking = await prisma.ranking.update({
        where: { id: existing.id },
        data: { rank: rank },
      });
    } else {
      ranking = await prisma.ranking.create({
        data: {
          user_id: user_id,
          tournament_id: tournament_id,
          rank: rank,
        },
      });
    }
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

    // Instead of using global user stats, compute per-tournament stats from
    // the tournament's matches so the leaderboard reflects this tournament.
    const tournamentMatches = await prisma.match.findMany({
      where: { tournament_id: latestTournamentWithRankings.id },
      select: { player1_id: true, player2_id: true, winner_id: true },
    });

    // Build per-user stats map
    const statsMap = {};
    const ensureUser = (id) => {
      if (!statsMap[id]) statsMap[id] = { gamesPlayed: 0, wins: 0, losses: 0 };
    };
    for (const m of tournamentMatches) {
      // If this is a bye match (player2_id === null), don't count it as a
      // played game for the bye player and don't count the auto-win. Byes
      // only advance the player to the next round but shouldn't affect
      // gamesPlayed/wins/losses statistics.
      const isBye = !m.player2_id;

      if (!isBye) {
        if (m.player1_id) {
          ensureUser(m.player1_id);
          statsMap[m.player1_id].gamesPlayed += 1;
        }
        if (m.player2_id) {
          ensureUser(m.player2_id);
          statsMap[m.player2_id].gamesPlayed += 1;
        }
        if (m.winner_id) {
          ensureUser(m.winner_id);
          statsMap[m.winner_id].wins += 1;
        }
      } else {
        // For bye matches we may still want to ensure the user entry exists
        // so they show up on the leaderboard, but do not increment gamesPlayed
        // or wins.
        if (m.player1_id) ensureUser(m.player1_id);
      }
    }
    // compute losses from gamesPlayed - wins
    Object.keys(statsMap).forEach((uid) => {
      statsMap[uid].losses = statsMap[uid].gamesPlayed - statsMap[uid].wins;
    });

    // Map to leaderboard format using ranking rows order
    const leaderboard = rankings.map((ranking) => {
      const user = ranking.user;
      const s = statsMap[user.id] || { gamesPlayed: 0, wins: 0, losses: 0 };
      const rankScore = s.wins * 3 + s.gamesPlayed * 0.5;
      const winRate =
        s.gamesPlayed > 0
          ? ((s.wins / s.gamesPlayed) * 100).toFixed(1) + "%"
          : "0%";
      return {
        id: user.id,
        username: user.username,
        profile_photo_url: user.profile_photo_url,
        gamesPlayed: s.gamesPlayed,
        wins: s.wins,
        losses: s.losses,
        winRate,
        rankScore: rankScore,
        rank: ranking.rank, // temporary
      };
    });

    // Sort by rankScore descending and assign correct ranks
    leaderboard.sort((a, b) => b.rankScore - a.rankScore);
    leaderboard.forEach((player, index) => {
      player.rank = index + 1;
      player.rankScore = player.rankScore.toFixed(1);
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
