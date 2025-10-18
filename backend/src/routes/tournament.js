import express from "express";
import pool from "../config/db.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Get all users
router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, profile_photo_url FROM users WHERE is_admin = false ORDER BY username"
    );
    const users = result.rows.map((user) => ({
      ...user,
      profile_photo_url: user.profile_photo_url
        ? `${req.protocol}://${req.get("host")}${user.profile_photo_url}`
        : null,
    }));
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create tournament and pair all participants
router.post("/create", authMiddleware, adminMiddleware, async (req, res) => {
  const { name, count } = req.body;
  try {
    // Create tournament
    const tournamentResult = await pool.query(
      "INSERT INTO tournaments (name, admin_id) VALUES ($1, $2) RETURNING *",
      [name, req.user.id]
    );
    const tournament = tournamentResult.rows[0];

    // Select random participants
    const participantsResult = await pool.query(
      "SELECT id, username, profile_photo_url FROM users WHERE id != $1 AND is_admin = false ORDER BY RANDOM() LIMIT $2",
      [req.user.id, count]
    );
    const participants = participantsResult.rows.map((user) => ({
      ...user,
      profile_photo_url: user.profile_photo_url
        ? `${req.protocol}://${req.get("host")}${user.profile_photo_url}`
        : null,
    }));

    // Add participants to the tournament
    for (const participant of participants) {
      await pool.query(
        "INSERT INTO participants (user_id, tournament_id) VALUES ($1, $2)",
        [participant.id, tournament.id]
      );
    }

    // Shuffle participants for random pairing
    let selectedParticipants = participants.sort(() => Math.random() - 0.5);
    let byePlayer = null;
    const round = 1;
    const matches = [];

    // Handle bye if there's an odd number of players
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
    }

    // Create matches for all participants
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
          player2_username: player2.username,
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

    res.json({
      tournament,
      participants,
      matches,
      byePlayer,
    });
  } catch (error) {
    console.error("Error creating tournament:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get matches for a tournament
router.get("/:tournamentId/matches", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT m.*, u1.username as player1_username, u2.username as player2_username, u3.username as winner_username " +
        "FROM matches m " +
        "LEFT JOIN users u1 ON m.player1_id = u1.id " +
        "LEFT JOIN users u2 ON m.player2_id = u2.id " +
        "LEFT JOIN users u3 ON m.winner_id = u3.id " +
        "WHERE m.tournament_id = $1",
      [req.params.tournamentId]
    );
    res.json(result.rows);
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
      res.json(result.rows[0]);
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
            player2_username: player2.username,
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

export default router;
