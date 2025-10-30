import express from "express";
import prisma from "../config/db.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";
import { formatProfilePhoto, formatMatch } from "./tournamentHelpers.js";

const router = express.Router();

// Get latest tournament
router.get("/latest", async (req, res) => {
  try {
    const tournament = await prisma.tournament.findFirst({
      orderBy: { id: "desc" },
      include: {
        participants: {
          include: { user: true },
          orderBy: { applied_at: "asc" },
        },
        matches: {
          include: {
            player1: true,
            player2: true,
            winner: true,
            round: true,
          },
        },
        Round: {
          include: {
            matches: {
              include: {
                player1: true,
                player2: true,
                winner: true,
              },
            },
          },
          orderBy: { round_number: "asc" },
        },
      },
    });

    if (!tournament) {
      return res.json({
        tournament: null,
        participants: [],
        matches: [],
        rounds: [],
        byePlayer: null,
      });
    }

    const participants = tournament.participants.map((p) => ({
      ...formatProfilePhoto(p.user, req),
      applied_at: p.applied_at,
      losses: p.losses,
    }));
    const matches = tournament.matches.map((match) => formatMatch(match, req));

    const rounds = tournament.Round.map((round) => ({
      round_number: round.round_number,
      is_completed: round.is_completed,
      start_time: round.start_time,
      end_time: round.end_time,
      matches: round.matches.map((match) => formatMatch(match, req)),
    }));

    // Use formatted matches (which include numeric `round`) to locate a bye
    // player for round 1. We already created `matches` above by formatting
    // tournament.matches, so search that array instead of the raw objects.
    const byePlayerMatch = matches.find(
      (m) => m.player2_id === null && m.round === 1
    );
    const byePlayer = byePlayerMatch
      ? formatProfilePhoto(byePlayerMatch.player1, req)
      : null;

    const formattedTournament = {
      ...tournament,
      participant_count: tournament.participants.length,
    };

    res.json({
      tournament: formattedTournament,
      participants,
      matches,
      rounds,
      byePlayer,
    });
  } catch (error) {
    console.error("Error fetching latest tournament:", error);
    res.status(500).json({ message: error.message });
  }
});

// Create tournament
router.post("/create", authMiddleware, adminMiddleware, async (req, res) => {
  const { name, max_players } = req.body;
  try {
    const tournament = await prisma.tournament.create({
      data: {
        name,
        admin_id: req.user.id,
        max_players,
        is_open: true,
      },
    });
    res.json({
      tournament: { ...tournament, participant_count: 0 },
      participants: [],
      matches: [],
      byePlayer: null,
    });
  } catch (error) {
    console.error("Error creating tournament:", error);
    res.status(500).json({ message: error.message });
  }
});

// Apply to tournament
router.post("/apply", authMiddleware, async (req, res) => {
  try {
    const tournament = await prisma.tournament.findFirst({
      where: { is_open: true },
      orderBy: { id: "desc" },
    });

    if (!tournament) {
      return res.status(404).json({ message: "No open tournament found" });
    }

    const participantCount = await prisma.participant.count({
      where: { tournament_id: tournament.id },
    });

    if (participantCount >= tournament.max_players) {
      await prisma.tournament.update({
        where: { id: tournament.id },
        data: { is_open: false },
      });
      return res.status(400).json({ message: "Tournament is full" });
    }

    const existingParticipant = await prisma.participant.findFirst({
      where: {
        tournament_id: tournament.id,
        user_id: req.user.id,
      },
    });

    if (existingParticipant) {
      return res.status(400).json({ message: "You have already applied" });
    }

    await prisma.participant.create({
      data: {
        user_id: req.user.id,
        tournament_id: tournament.id,
      },
    });

    await prisma.notification.create({
      data: {
        user_id: req.user.id,
        tournament_id: tournament.id,
        message: `You have applied to participate in ${tournament.name}.`,
      },
    });

    const participantCountAfter = await prisma.participant.count({
      where: { tournament_id: tournament.id },
    });

    if (participantCountAfter >= tournament.max_players) {
      await prisma.tournament.update({
        where: { id: tournament.id },
        data: { is_open: false },
      });
    }

    res.json({ message: "Successfully applied to tournament" });
  } catch (error) {
    console.error("Error applying to tournament:", error);
    res.status(500).json({ message: error.message });
  }
});

// Close tournament
router.post("/close", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const tournament = await prisma.tournament.findFirst({
      where: { admin_id: req.user.id },
      orderBy: { id: "desc" },
    });

    if (!tournament) {
      return res.status(404).json({ message: "No tournament found" });
    }

    await prisma.tournament.update({
      where: { id: tournament.id },
      data: { is_open: false },
    });

    res.json({ message: "Tournament closed successfully" });
  } catch (error) {
    console.error("Error closing tournament:", error);
    res.status(500).json({ message: error.message });
  }
});

// Start tournament (create round 1 with random pairings for all participants)
router.post("/start", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const tournament = await prisma.tournament.findFirst({
      where: { admin_id: req.user.id },
      orderBy: { id: "desc" },
      include: {
        participants: {
          include: { user: true },
          orderBy: { applied_at: "asc" },
        },
      },
    });

    if (!tournament) {
      return res.status(404).json({ message: "No tournament found" });
    }

    const participants = tournament.participants.map((p) =>
      formatProfilePhoto(p.user, req)
    );

    if (participants.length === 0) {
      return res
        .status(400)
        .json({ message: "No participants in the tournament" });
    }

    await prisma.tournament.update({
      where: { id: tournament.id },
      data: { is_open: false },
    });

    const round = await prisma.round.create({
      data: {
        tournament_id: tournament.id,
        round_number: 1,
        start_time: new Date(),
      },
    });

    let selectedParticipants = [...participants].sort(
      () => Math.random() - 0.5
    );
    const roundMatches = [];
    let byePlayer = null;

    // Pair all participants randomly for round 1, handle odd number with bye
    for (let i = 0; i < selectedParticipants.length; i += 2) {
      const player1 = selectedParticipants[i];
      const player2 = selectedParticipants[i + 1];
      if (player1 && player2) {
        const match = await prisma.match.create({
          data: {
            tournament_id: tournament.id,
            round_id: round.id,
            player1_id: player1.id,
            player2_id: player2.id,
          },
        });
        roundMatches.push({
          id: match.id,
          round_id: round.id,
          player1_id: player1.id,
          player1_username: player1.username,
          player1_avatar_url: player1.profile_photo_url,
          player2_id: player2.id,
          player2_username: player2.username,
          player2_avatar_url: player2.profile_photo_url,
          round: 1,
        });
        await prisma.notification.createMany({
          data: [
            {
              user_id: player1.id,
              tournament_id: tournament.id,
              message: `You are paired against ${player2.username} in Round 1.`,
            },
            {
              user_id: player2.id,
              tournament_id: tournament.id,
              message: `You are paired against ${player1.username} in Round 1.`,
            },
          ],
        });
      } else if (player1 && !player2) {
        // Odd number of participants, give bye
        byePlayer = player1;
        const byeMatch = await prisma.match.create({
          data: {
            tournament_id: tournament.id,
            round_id: round.id,
            player1_id: player1.id,
            winner_id: player1.id, // Bye player automatically wins
          },
        });
        roundMatches.push({
          id: byeMatch.id,
          round_id: round.id,
          player1_id: player1.id,
          player1_username: player1.username,
          player1_avatar_url: player1.profile_photo_url,
          player2_id: null,
          player2_username: null,
          player2_avatar_url: null,
          winner_id: player1.id,
          winner_username: player1.username,
          round: 1,
        });
        await prisma.notification.create({
          data: {
            user_id: player1.id,
            tournament_id: tournament.id,
            message: `You have a bye in Round 1 and advance automatically.`,
          },
        });
      }
    }

    const updatedTournament = {
      ...tournament,
      participant_count: participants.length,
    };
    res.json({
      tournament: updatedTournament,
      participants,
      rounds: [{ ...round, matches: roundMatches }],
      matches: roundMatches,
      byePlayer,
    });
  } catch (error) {
    console.error("Error starting tournament:", error);
    res.status(500).json({ message: error.message });
  }
});

// Reset tournament data
router.delete("/reset", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const tournamentIds = await prisma.tournament.findMany({
      where: { admin_id: req.user.id },
      select: { id: true },
    });

    const ids = tournamentIds.map((t) => t.id);

    await prisma.ranking.deleteMany({
      where: { tournament_id: { in: ids } },
    });

    await prisma.match.deleteMany({
      where: { tournament_id: { in: ids } },
    });

    await prisma.participant.deleteMany({
      where: { tournament_id: { in: ids } },
    });

    await prisma.notification.deleteMany({
      where: { tournament_id: { in: ids } },
    });

    await prisma.tournament.deleteMany({
      where: { admin_id: req.user.id },
    });

    res.json({ message: "Tournament data reset successfully" });
  } catch (error) {
    console.error("Error resetting tournament:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
