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

// Create tournament and pair players
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

    // Randomly select two players for the first match
    const selectedParticipants = participants
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
    if (selectedParticipants.length === 2) {
      await pool.query(
        "INSERT INTO matches (tournament_id, player1_id, player2_id, round) VALUES ($1, $2, $3, $4)",
        [
          tournament.id,
          selectedParticipants[0].id,
          selectedParticipants[1].id,
          1,
        ]
      );
    }

    res.json({
      tournament,
      participants,
      pairedPlayers:
        selectedParticipants.length === 2 ? selectedParticipants : [],
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

export default router;
