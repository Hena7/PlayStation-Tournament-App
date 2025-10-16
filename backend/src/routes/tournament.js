import express from 'express'
import pool from '../config/db.js'
import { authMiddleware, adminMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.post('/create', authMiddleware, adminMiddleware, async (req, res) => {
  const { name, count } = req.body
  try {
    const tournamentResult = await pool.query(
      'INSERT INTO tournaments (name, admin_id) VALUES ($1, $2) RETURNING *',
      [name, req.user.id]
    )
    const tournament = tournamentResult.rows[0]

    const participantsResult = await pool.query(
      'SELECT id FROM users WHERE id != $1 ORDER BY RANDOM() LIMIT $2',
      [req.user.id, count]
    )
    const participants = participantsResult.rows

    for (const participant of participants) {
      await pool.query(
        'INSERT INTO participants (user_id, tournament_id) VALUES ($1, $2)',
        [participant.id, tournament.id]
      )
    }

    const selectedParticipants = participants.slice(0, 2)
    await pool.query(
      'INSERT INTO matches (tournament_id, player1_id, player2_id, round) VALUES ($1, $2, $3, $4)',
      [tournament.id, selectedParticipants[0].id, selectedParticipants[1].id, 1]
    )

    res.json(tournament)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.get('/:tournamentId/matches', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM matches WHERE tournament_id = $1',
      [req.params.tournamentId]
    )
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router