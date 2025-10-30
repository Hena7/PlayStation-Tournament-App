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
        round: true,
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
      const match = await prisma.match.findUnique({
        where: { id: parseInt(matchId) },
        include: {
          player1: true,
          player2: true,
          winner: true,
        },
      });

      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }

      // Determine loser and increment their losses
      let loser_id = null;
      if (match.player1_id === winner_id) {
        loser_id = match.player2_id;
      } else if (match.player2_id === winner_id) {
        loser_id = match.player1_id;
      }

      if (loser_id) {
        await prisma.participant.updateMany({
          where: {
            user_id: loser_id,
            tournament_id: match.tournament_id,
          },
          data: {
            losses: { increment: 1 },
          },
        });
        // Update user stats for loser
        await prisma.user.update({
          where: { id: loser_id },
          data: {
            gamesPlayed: { increment: 1 },
            losses: { increment: 1 },
          },
        });
      }

      // Update user stats for winner
      await prisma.user.update({
        where: { id: winner_id },
        data: {
          gamesPlayed: { increment: 1 },
          wins: { increment: 1 },
        },
      });

      const updatedMatch = await prisma.match.update({
        where: { id: parseInt(matchId) },
        data: { winner_id, score },
        include: {
          player1: true,
          player2: true,
          winner: true,
          round: true,
        },
      });

      const formattedMatch = formatMatch(updatedMatch, req);
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

      const currentRound = await prisma.round.findFirst({
        where: { tournament_id: tournamentId },
        orderBy: { round_number: "desc" },
        select: { round_number: true },
      });

      const roundNum = currentRound ? currentRound.round_number : 0;

      // Get active participants based on losses
      // Always exclude participants who have reached 3 or more losses
      // (eliminated). Participants with losses < 3 are eligible.
      const participants = await prisma.participant.findMany({
        where: {
          tournament_id: tournamentId,
          losses: { lt: 3 }, // eliminated at 3 losses
        },
        include: { user: true },
      });

      const activeUsers = participants
        .map((p) => ({
          ...formatProfilePhoto(p.user, req),
          bye_count: p.bye_count,
        }))
        .sort(() => Math.random() - 0.5);

      const nextRoundNum = roundNum + 1;

      const round = await prisma.round.create({
        data: {
          tournament_id: tournamentId,
          round_number: nextRoundNum,
          start_time: new Date(),
        },
      });

      let byePlayer = null;
      const matches = [];

      if (activeUsers.length % 2 !== 0) {
        // Sort by bye_count ascending, then random for tie
        activeUsers.sort(
          (a, b) => a.bye_count - b.bye_count || Math.random() - 0.5
        );
        byePlayer = activeUsers.pop();
        const byeMatch = await prisma.match.create({
          data: {
            tournament_id: tournamentId,
            round_id: round.id,
            player1_id: byePlayer.id,
            winner_id: byePlayer.id, // Bye player automatically wins
          },
        });
        // Increment bye count
        await prisma.participant.update({
          where: {
            user_id_tournament_id: {
              user_id: byePlayer.id,
              tournament_id: tournamentId,
            },
          },
          data: { bye_count: { increment: 1 } },
        });
        await prisma.notification.create({
          data: {
            user_id: byePlayer.id,
            tournament_id: tournamentId,
            message: `You have a bye in Round ${nextRoundNum} and advance automatically.`,
          },
        });
        matches.push({
          id: byeMatch.id,
          round_id: round.id,
          player1_id: byePlayer.id,
          player1_username: byePlayer.username,
          player1_avatar_url: byePlayer.profile_photo_url,
          player2_id: null,
          player2_username: null,
          player2_avatar_url: null,
          winner_id: byePlayer.id,
          winner_username: byePlayer.username,
          round: nextRoundNum,
        });
      }

      for (let i = 0; i < activeUsers.length; i += 2) {
        const player1 = activeUsers[i];
        const player2 = activeUsers[i + 1];
        if (player1 && player2) {
          const match = await prisma.match.create({
            data: {
              tournament_id: tournamentId,
              round_id: round.id,
              player1_id: player1.id,
              player2_id: player2.id,
            },
          });
          matches.push({
            id: match.id,
            round_id: round.id,
            player1_id: player1.id,
            player1_username: player1.username,
            player1_avatar_url: player1.profile_photo_url,
            player2_id: player2.id,
            player2_username: player2.username,
            player2_avatar_url: player2.profile_photo_url,
            round: nextRoundNum,
          });
          await prisma.notification.createMany({
            data: [
              {
                user_id: player1.id,
                tournament_id: tournamentId,
                message: `You are paired against ${player2.username} in Round ${nextRoundNum}.`,
              },
              {
                user_id: player2.id,
                tournament_id: tournamentId,
                message: `You are paired against ${player1.username} in Round ${nextRoundNum}.`,
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
