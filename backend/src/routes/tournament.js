import express from "express";
import prisma from "../config/db.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Get all users
router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { is_admin: false },
      select: {
        id: true,
        username: true,
        email: true,
        profile_photo_url: true,
        full_name: true,
        ethiopian_phone: true,
        favorite_game: true,
        controller_id: true,
        gamesPlayed: true,
        wins: true,
        losses: true,
      },
      orderBy: { username: "asc" },
    });
    const formattedUsers = users.map((user) => ({
      ...user,
      profile_photo_url: user.profile_photo_url
        ? `${req.protocol}://${req.get("host")}${user.profile_photo_url}`
        : null,
    }));
    res.json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get latest tournament
router.get("/latest", authMiddleware, async (req, res) => {
  try {
    const tournamentResult = await pool.query(
      "SELECT * FROM tournaments ORDER BY id DESC LIMIT 1"
    );
    if (tournamentResult.rows.length === 0) {
      return res.json({
        tournament: null,
        participants: [],
        matches: [],
        byePlayer: null,
      });
    }
    const tournament = tournamentResult.rows[0];

    const participantsResult = await pool.query(
      "SELECT u.id, u.username, u.profile_photo_url, p.applied_at " +
        "FROM participants p JOIN users u ON p.user_id = u.id " +
        "WHERE p.tournament_id = $1 ORDER BY p.applied_at",
      [tournament.id]
    );
    const participants = participantsResult.rows.map((user) => ({
      ...user,
      profile_photo_url: user.profile_photo_url
        ? `${req.protocol}://${req.get("host")}${user.profile_photo_url}`
        : null,
    }));

    const participantCount = await pool.query(
      "SELECT COUNT(*) as count FROM participants WHERE tournament_id = $1",
      [tournament.id]
    );
    tournament.participant_count = parseInt(participantCount.rows[0].count);

    const matchesResult = await pool.query(
      "SELECT m.*, u1.username as player1_username, u1.profile_photo_url as player1_profile_photo_url, u2.username as player2_username, u2.profile_photo_url as player2_profile_photo_url, u3.username as winner_username " +
        "FROM matches m " +
        "LEFT JOIN users u1 ON m.player1_id = u1.id " +
        "LEFT JOIN users u2 ON m.player2_id = u2.id " +
        "LEFT JOIN users u3 ON m.winner_id = u3.id " +
        "WHERE m.tournament_id = $1",
      [tournament.id]
    );
    const matches = matchesResult.rows.map((match) => ({
      ...match,
      player1_avatar_url: match.player1_profile_photo_url
        ? `${req.protocol}://${req.get("host")}${
            match.player1_profile_photo_url
          }`
        : null,
      player2_avatar_url: match.player2_profile_photo_url
        ? `${req.protocol}://${req.get("host")}${
            match.player2_profile_photo_url
          }`
        : null,
    }));

    const byePlayerResult = await pool.query(
      "SELECT u.id, u.username, u.profile_photo_url " +
        "FROM matches m JOIN users u ON m.player1_id = u.id " +
        "WHERE m.tournament_id = $1 AND m.player2_id IS NULL AND m.round = 1",
      [tournament.id]
    );
    const byePlayer = byePlayerResult.rows[0]
      ? {
          id: byePlayerResult.rows[0].id,
          username: byePlayerResult.rows[0].username,
          profile_photo_url: byePlayerResult.rows[0].profile_photo_url
            ? `${req.protocol}://${req.get("host")}${
                byePlayerResult.rows[0].profile_photo_url
              }`
            : null,
        }
      : null;

    res.json({ tournament, participants, matches, byePlayer });
  } catch (error) {
    console.error("Error fetching latest tournament:", error);
    res.status(500).json({ message: error.message });
  }
});

// Create tournament
router.post("/create", authMiddleware, adminMiddleware, async (req, res) => {
  const { name, max_players } = req.body;
  try {
    const tournamentResult = await pool.query(
      "INSERT INTO tournaments (name, admin_id, max_players, is_open) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, req.user.id, max_players, true]
    );
    const tournament = tournamentResult.rows[0];
    tournament.participant_count = 0;
    res.json({ tournament, participants: [], matches: [], byePlayer: null });
  } catch (error) {
    console.error("Error creating tournament:", error);
    res.status(500).json({ message: error.message });
  }
});

// Apply to tournament
router.post("/apply", authMiddleware, async (req, res) => {
  try {
    const tournamentResult = await pool.query(
      "SELECT * FROM tournaments WHERE is_open = true ORDER BY id DESC LIMIT 1"
    );
    if (tournamentResult.rows.length === 0) {
      return res.status(404).json({ message: "No open tournament found" });
    }
    const tournament = tournamentResult.rows[0];

    const participantCount = await pool.query(
      "SELECT COUNT(*) as count FROM participants WHERE tournament_id = $1",
      [tournament.id]
    );
    if (parseInt(participantCount.rows[0].count) >= tournament.max_players) {
      await pool.query("UPDATE tournaments SET is_open = false WHERE id = $1", [
        tournament.id,
      ]);
      return res.status(400).json({ message: "Tournament is full" });
    }

    const existingParticipant = await pool.query(
      "SELECT * FROM participants WHERE tournament_id = $1 AND user_id = $2",
      [tournament.id, req.user.id]
    );
    if (existingParticipant.rows.length > 0) {
      return res.status(400).json({ message: "You have already applied" });
    }

    await pool.query(
      "INSERT INTO participants (user_id, tournament_id) VALUES ($1, $2)",
      [req.user.id, tournament.id]
    );
    await pool.query(
      "INSERT INTO notifications (user_id, tournament_id, message) VALUES ($1, $2, $3)",
      [
        req.user.id,
        tournament.id,
        `You have applied to participate in ${tournament.name}.`,
      ]
    );

    const participantCountAfter = await pool.query(
      "SELECT COUNT(*) as count FROM participants WHERE tournament_id = $1",
      [tournament.id]
    );
    if (
      parseInt(participantCountAfter.rows[0].count) >= tournament.max_players
    ) {
      await pool.query("UPDATE tournaments SET is_open = false WHERE id = $1", [
        tournament.id,
      ]);
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
    const tournamentResult = await pool.query(
      "SELECT * FROM tournaments WHERE admin_id = $1 ORDER BY id DESC LIMIT 1",
      [req.user.id]
    );
    if (tournamentResult.rows.length === 0) {
      return res.status(404).json({ message: "No tournament found" });
    }
    const tournament = tournamentResult.rows[0];
    await pool.query("UPDATE tournaments SET is_open = false WHERE id = $1", [
      tournament.id,
    ]);
    res.json({ message: "Tournament closed successfully" });
  } catch (error) {
    console.error("Error closing tournament:", error);
    res.status(500).json({ message: error.message });
  }
});

// Start tournament (pair participants)
router.post("/start", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const tournamentResult = await pool.query(
      "SELECT * FROM tournaments WHERE admin_id = $1 ORDER BY id DESC LIMIT 1",
      [req.user.id]
    );
    if (tournamentResult.rows.length === 0) {
      return res.status(404).json({ message: "No tournament found" });
    }
    const tournament = tournamentResult.rows[0];

    const participantsResult = await pool.query(
      "SELECT u.id, u.username, u.profile_photo_url " +
        "FROM participants p JOIN users u ON p.user_id = u.id " +
        "WHERE p.tournament_id = $1 ORDER BY p.applied_at",
      [tournament.id]
    );
    const participants = participantsResult.rows.map((user) => ({
      ...user,
      profile_photo_url: user.profile_photo_url
        ? `${req.protocol}://${req.get("host")}${user.profile_photo_url}`
        : null,
    }));

    if (participants.length === 0) {
      return res
        .status(400)
        .json({ message: "No participants in the tournament" });
    }

    await pool.query("UPDATE tournaments SET is_open = false WHERE id = $1", [
      tournament.id,
    ]);

    let selectedParticipants = participants.sort(() => Math.random() - 0.5);
    let byePlayer = null;
    const round = 1;
    const matches = [];

    if (selectedParticipants.length % 2 !== 0) {
      byePlayer = selectedParticipants.pop();
      await pool.query(
        "INSERT INTO matches (tournament_id, player1_id, winner_id, round) VALUES ($1, $2, $3, $4) RETURNING id",
        [tournament.id, byePlayer.id, byePlayer.id, round]
      );
      await pool.query(
        "INSERT INTO notifications (user_id, tournament_id, message) VALUES ($1, $2, $3)",
        [
          byePlayer.id,
          tournament.id,
          `You have a bye in Round ${round} and advance automatically.`,
        ]
      );
      matches.push({
        id: tournament.id,
        player1_id: byePlayer.id,
        player1_username: byePlayer.username,
        player1_avatar_url: byePlayer.profile_photo_url,
        player2_id: null,
        player2_username: null,
        player2_avatar_url: null,
        winner_id: byePlayer.id,
        winner_username: byePlayer.username,
        round,
      });
    }

    for (let i = 0; i < selectedParticipants.length; i += 2) {
      const player1 = selectedParticipants[i];
      const player2 = selectedParticipants[i + 1];
      if (player1 && player2) {
        const matchResult = await pool.query(
          "INSERT INTO matches (tournament_id, player1_id, player2_id, round) VALUES ($1, $2, $3, $4) RETURNING id",
          [tournament.id, player1.id, player2.id, round]
        );
        matches.push({
          id: matchResult.rows[0].id,
          player1_id: player1.id,
          player2_id: player2.id,
          player1_username: player1.username,
          player1_avatar_url: player1.profile_photo_url,
          player2_username: player2.username,
          player2_avatar_url: player2.profile_photo_url,
          round,
        });
        await pool.query(
          "INSERT INTO notifications (user_id, tournament_id, message) VALUES ($1, $2, $3), ($4, $5, $6)",
          [
            player1.id,
            tournament.id,
            `You are paired against ${player2.username} in Round ${round}.`,
            player2.id,
            tournament.id,
            `You are paired against ${player1.username} in Round ${round}.`,
          ]
        );
      }
    }

    tournament.participant_count = participants.length;
    res.json({ tournament, participants, matches, byePlayer });
  } catch (error) {
    console.error("Error starting tournament:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get matches for a tournament
router.get("/:tournamentId/matches", authMiddleware, async (req, res) => {
  try {
    // Verify user is a participant or admin
    const tournamentResult = await pool.query(
      "SELECT * FROM tournaments WHERE id = $1",
      [req.params.tournamentId]
    );
    if (tournamentResult.rows.length === 0) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    const participantResult = await pool.query(
      "SELECT * FROM participants WHERE tournament_id = $1 AND user_id = $2",
      [req.params.tournamentId, req.user.id]
    );
    const isAdmin = tournamentResult.rows[0].admin_id === req.user.id;
    if (!isAdmin && participantResult.rows.length === 0) {
      return res
        .status(403)
        .json({ message: "Not authorized to view matches" });
    }

    const result = await pool.query(
      "SELECT m.*, u1.username as player1_username, u1.profile_photo_url as player1_profile_photo_url, u2.username as player2_username, u2.profile_photo_url as player2_profile_photo_url, u3.username as winner_username " +
        "FROM matches m " +
        "LEFT JOIN users u1 ON m.player1_id = u1.id " +
        "LEFT JOIN users u2 ON m.player2_id = u2.id " +
        "LEFT JOIN users u3 ON m.winner_id = u3.id " +
        "WHERE m.tournament_id = $1",
      [req.params.tournamentId]
    );
    const matches = result.rows.map((match) => ({
      ...match,
      player1_avatar_url: match.player1_profile_photo_url
        ? `${req.protocol}://${req.get("host")}${
            match.player1_profile_photo_url
          }`
        : null,
      player2_avatar_url: match.player2_profile_photo_url
        ? `${req.protocol}://${req.get("host")}${
            match.player2_profile_photo_url
          }`
        : null,
    }));
    res.json(matches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update match winner
router.put(
  "/matches/:matchId",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    const { matchId } = req.params;
    const { winner_id } = req.body;
    try {
      const result = await pool.query(
        "UPDATE matches SET winner_id = $1 WHERE id = $2 RETURNING *",
        [winner_id, matchId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Match not found" });
      }
      const match = result.rows[0];
      const updatedMatch = {
        ...match,
        player1_avatar_url: match.player1_profile_photo_url
          ? `${req.protocol}://${req.get("host")}${
              match.player1_profile_photo_url
            }`
          : null,
        player2_avatar_url: match.player2_profile_photo_url
          ? `${req.protocol}://${req.get("host")}${
              match.player2_profile_photo_url
            }`
          : null,
      };
      res.json(updatedMatch);
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
      const { tournamentId } = req.params;
      const currentRoundResult = await pool.query(
        "SELECT MAX(round) as current_round FROM matches WHERE tournament_id = $1",
        [tournamentId]
      );
      const currentRound = currentRoundResult.rows[0].current_round || 0;
      const winnersResult = await pool.query(
        "SELECT winner_id, u.username, u.profile_photo_url " +
          "FROM matches m JOIN users u ON m.winner_id = u.id " +
          "WHERE m.tournament_id = $1 AND m.round = $2",
        [tournamentId, currentRound]
      );
      let winners = winnersResult.rows.map((w) => ({
        id: w.winner_id,
        username: w.username,
        profile_photo_url: w.profile_photo_url
          ? `${req.protocol}://${req.get("host")}${w.profile_photo_url}`
          : null,
      }));
      winners = winners.sort(() => Math.random() - 0.5);
      const nextRound = currentRound + 1;
      let byePlayer = null;
      const matches = [];

      if (winners.length % 2 !== 0) {
        byePlayer = winners.pop();
        await pool.query(
          "INSERT INTO matches (tournament_id, player1_id, winner_id, round) VALUES ($1, $2, $3, $4)",
          [tournamentId, byePlayer.id, byePlayer.id, nextRound]
        );
        await pool.query(
          "INSERT INTO notifications (user_id, tournament_id, message) VALUES ($1, $2, $3)",
          [
            byePlayer.id,
            tournamentId,
            `You have a bye in Round ${nextRound} and advance automatically.`,
          ]
        );
        matches.push({
          id: tournamentId,
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

      for (let i = 0; i < winners.length; i += 2) {
        const player1 = winners[i];
        const player2 = winners[i + 1];
        if (player1 && player2) {
          const matchResult = await pool.query(
            "INSERT INTO matches (tournament_id, player1_id, player2_id, round) VALUES ($1, $2, $3, $4) RETURNING id",
            [tournamentId, player1.id, player2.id, nextRound]
          );
          matches.push({
            id: matchResult.rows[0].id,
            player1_id: player1.id,
            player2_id: player2.id,
            player1_username: player1.username,
            player1_avatar_url: player1.profile_photo_url,
            player2_username: player2.username,
            player2_avatar_url: player2.profile_photo_url,
            round: nextRound,
          });
          await pool.query(
            "INSERT INTO notifications (user_id, tournament_id, message) VALUES ($1, $2, $3), ($4, $5, $6)",
            [
              player1.id,
              tournamentId,
              `You are paired against ${player2.username} in Round ${nextRound}.`,
              player2.id,
              tournamentId,
              `You are paired against ${player1.username} in Round ${nextRound}.`,
            ]
          );
        }
      }

      res.json({ matches, byePlayer });
    } catch (error) {
      console.error("Error creating next round:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Reset tournament data
router.delete("/reset", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM rankings WHERE tournament_id IN (SELECT id FROM tournaments WHERE admin_id = $1)",
      [req.user.id]
    );
    await pool.query(
      "DELETE FROM matches WHERE tournament_id IN (SELECT id FROM tournaments WHERE admin_id = $1)",
      [req.user.id]
    );
    await pool.query(
      "DELETE FROM participants WHERE tournament_id IN (SELECT id FROM tournaments WHERE admin_id = $1)",
      [req.user.id]
    );
    await pool.query(
      "DELETE FROM notifications WHERE tournament_id IN (SELECT id FROM tournaments WHERE admin_id = $1)",
      [req.user.id]
    );
    await pool.query("DELETE FROM tournaments WHERE admin_id = $1", [
      req.user.id,
    ]);
    res.json({ message: "Tournament data reset successfully" });
  } catch (error) {
    console.error("Error resetting tournament:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
