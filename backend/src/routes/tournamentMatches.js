import express from "express";
import prisma from "../config/db.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";
import { formatProfilePhoto, formatMatch } from "./tournamentHelpers.js";

const router = express.Router();

// Get matches for a tournament
router.get("/:tournamentId/matches", authMiddleware, async (req, res) => {
  try {
    const tournamentId = parseInt(req.params.tournamentId);

    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
    });

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    const isParticipant = await prisma.participant.findFirst({
      where: {
        tournament_id: tournamentId,
        user_id: req.user.id,
      },
    });

    const isAdmin = tournament.admin_id === req.user.id;

    if (!isAdmin && !isParticipant) {
      return res
        .status(403)
        .json({ message: "Not authorized to view matches" });
    }

    const matches = await prisma.match.findMany({
      where: { tournament_id: tournamentId },
      include: {
        player1: true,
        player2: true,
        winner: true,
      },
    });

    const formattedMatches = matches.map((match) => formatMatch(match, req));
    res.json(formattedMatches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update match winner and score
router.put(
  "/matches/:matchId",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    const { matchId } = req.params;
    const { winner_id, score } = req.body;
    try {
      const match = await prisma.match.update({
        where: { id: parseInt(matchId) },
        data: { winner_id, score },
        include: {
          player1: true,
          player2: true,
          winner: true,
        },
      });

      const formattedMatch = formatMatch(match, req);
      res.json(formattedMatch);
    } catch (error) {
      console.error("Error updating match:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Create next round
router.post(
  "/:tournamentId/next-round",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const tournamentId = parseInt(req.params.tournamentId);

      const currentRound = await prisma.match.findFirst({
        where: { tournament_id: tournamentId },
        orderBy: { round: "desc" },
        select: { round: true },
      });

      const round = currentRound ? currentRound.round : 0;

      const winners = await prisma.match.findMany({
        where: {
          tournament_id: tournamentId,
          round: round,
        },
        include: { winner: true },
      });

      const winnerUsers = winners
        .filter((m) => m.winner)
        .map((m) => formatProfilePhoto(m.winner, req))
        .sort(() => Math.random() - 0.5);

      const nextRound = round + 1;
      let byePlayer = null;
      const matches = [];

      if (winnerUsers.length % 2 !== 0) {
        byePlayer = winnerUsers.pop();
        const byeMatch = await prisma.match.create({
          data: {
            tournament_id: tournamentId,
            player1_id: byePlayer.id,
            winner_id: byePlayer.id,
            round: nextRound,
          },
        });
        await prisma.notification.create({
          data: {
            user_id: byePlayer.id,
            tournament_id: tournamentId,
            message: `You have a bye in Round ${nextRound} and advance automatically.`,
          },
        });
        matches.push({
          id: byeMatch.id,
          player1_id: byePlayer.id,
          player1_username: byePlayer.username,
          player1_avatar_url: byePlayer.profile_photo_url,
          player2_id: null,
          player2_username: null,
          player2_avatar_url: null,
          winner_id: byePlayer.id,
          winner_username: byePlayer.username,
          round: nextRound,
        });
      }

      for (let i = 0; i < winnerUsers.length; i += 2) {
        const player1 = winnerUsers[i];
        const player2 = winnerUsers[i + 1];
        if (player1 && player2) {
          const match = await prisma.match.create({
            data: {
              tournament_id: tournamentId,
              player1_id: player1.id,
              player2_id: player2.id,
              round: nextRound,
            },
          });
          matches.push({
            id: match.id,
            player1_id: player1.id,
            player2_id: player2.id,
            player1_username: player1.username,
            player1_avatar_url: player1.profile_photo_url,
            player2_username: player2.username,
            player2_avatar_url: player2.profile_photo_url,
            round: nextRound,
          });
          await prisma.notification.createMany({
            data: [
              {
                user_id: player1.id,
                tournament_id: tournamentId,
                message: `You are paired against ${player2.username} in Round ${nextRound}.`,
              },
              {
                user_id: player2.id,
                tournament_id: tournamentId,
                message: `You are paired against ${player1.username} in Round ${nextRound}.`,
              },
            ],
          });
        }
      }

      res.json({ matches, byePlayer });
    } catch (error) {
      console.error("Error creating next round:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
