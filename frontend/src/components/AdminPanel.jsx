import { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

function AdminPanel() {
  const [participantsCount, setParticipantsCount] = useState(10)
  const [tournament, setTournament] = useState(null)
  const [matches, setMatches] = useState([])
  const [rankings, setRankings] = useState([])

  const handleCreateTournament = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        '/api/tournament/create',
        { name: `Tournament ${new Date().toISOString()}`, count: participantsCount },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setTournament(response.data)
    } catch (error) {
      console.error(error)
    }
  }

  const handleUpdateRanking = async (userId, rank) => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        '/api/ranking',
        { user_id: userId, tournament_id: tournament.id, rank },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setRankings([...rankings, { user_id: userId, rank }])
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    const fetchMatches = async () => {
      if (tournament) {
        const token = localStorage.getItem('token')
        const response = await axios.get(`/api/tournament/${tournament.id}/matches`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setMatches(response.data)
      }
    }
    fetchMatches()
  }, [tournament])

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-900 to-black">
      <h1 className="text-4xl font-bold mb-8 text-center">Admin Panel</h1>
      <Card className="bg-gray-800 border-none mb-6">
        <CardHeader>
          <CardTitle>Create Tournament</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="number"
            placeholder="Number of participants (10 or 50)"
            value={participantsCount}
            onChange={(e) => setParticipantsCount(Number(e.target.value))}
            className="mb-4"
          />
          <Button onClick={handleCreateTournament} className="bg-primary hover:bg-blue-700">
            Create Tournament
          </Button>
        </CardContent>
      </Card>
      <Card className="bg-gray-800 border-none">
        <CardHeader>
          <CardTitle>Manage Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          {matches.map((match) => (
            <div key={match.id} className="mb-4">
              <p>
                Round {match.round}: {match.player1_id} vs {match.player2_id}
              </p>
              <Input
                type="number"
                placeholder="Winner ID"
                onChange={(e) => handleUpdateRanking(Number(e.target.value), matches.length - match.round + 1)}
                className="mt-2"
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminPanel