import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

function UserDashboard() {
  const [rankings, setRankings] = useState([]);
  const [matches, setMatches] = useState([]);
  const URL = "http://localhost:5000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [rankingsRes, matchesRes] = await Promise.all([
          axios.get(`${URL}/api/ranking`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${URL}/api/tournament/matches`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setRankings(rankingsRes.data);
        setMatches(matchesRes.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-900 to-black">
      <h1 className="text-4xl font-bold mb-8 text-center">User Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-none">
          <CardHeader>
            <CardTitle>Your Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            {rankings.map((ranking) => (
              <p key={ranking.id}>
                Tournament: {ranking.tournament_id} - Rank: {ranking.rank}
              </p>
            ))}
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-none">
          <CardHeader>
            <CardTitle>Match History</CardTitle>
          </CardHeader>
          <CardContent>
            {matches.map((match) => (
              <p key={match.id}>
                Round {match.round}: {match.player1_id} vs {match.player2_id} -
                Winner: {match.winner_id || "Pending"}
              </p>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default UserDashboard;
