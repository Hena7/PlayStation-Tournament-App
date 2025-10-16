import express from 'express'
import pool from '../config/db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.get('/matches', authMiddleware, async (req, res) => {
  try {
    const participantTournaments = await pool.query(
      'SELECT tournament_id FROM participants WHERE user_id = $1',
      [req.user.id]
    )

    if (participantTournaments.rows.length === 0) {
      return res.json([]);
    }

    const tournamentIds = participantTournaments.rows.map(row => row.tournament_id);

    const matchesResult = await pool.query(
      'SELECT * FROM matches WHERE tournament_id = ANY($1)',
      [tournamentIds]
    )
    
    res.json(matchesResult.rows)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
