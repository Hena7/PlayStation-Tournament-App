import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { CheckCircle } from "lucide-react";
import api from "../lib/api";
import { useState } from "react";

function RankingManagement({ tournament, matches, participants, onUpdate }) {
  const [isSelectingWinner, setIsSelectingWinner] = useState(null);

  const handleUpdateRanking = async (matchId, winnerId) => {
    setIsSelectingWinner(matchId);
    try {
      const token = localStorage.getItem("token");
      const match = matches.find((m) => m.id === matchId);
      await api.post(
        "/api/ranking",
        { user_id: winnerId, tournament_id: tournament.id, rank: match.round },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await api.put(
        `/api/tournament/matches/${matchId}`,
        { winner_id: winnerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const response = await api.get(
        `/api/tournament/${tournament.id}/matches`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      onUpdate(response.data);
    } catch (error) {
      console.error("Error updating ranking:", error);
    } finally {
      setIsSelectingWinner(null);
    }
  };

  const handleNextRound = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        `/api/tournament/${tournament.id}/next-round`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdate([...matches, ...response.data.matches]);
    } catch (error) {
      console.error("Error creating next round:", error);
    }
  };

  const winners = matches.filter((m) => m.winner_id).map((m) => m.winner_id);

  return (
    <Card className="bg-gray-800 border-none">
      <CardHeader>
        <CardTitle>Manage Rankings</CardTitle>
      </CardHeader>
      <CardContent>
        {matches.length === 0 ? (
          <p>No matches available.</p>
        ) : (
          <>
            {matches
              .filter((match) => !match.winner_id)
              .map((match) => (
                <div key={match.id} className="mb-4">
                  <p className="font-semibold flex items-center">
                    Round {match.round}: {match.player1_username} vs{" "}
                    {match.player2_username || "Bye"}
                    {match.winner_username && (
                      <span className="text-green-400 ml-2 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-1" />
                        Winner: {match.winner_username}
                      </span>
                    )}
                  </p>
                  {!match.winner_id && match.player2_id && (
                    <div className="flex space-x-2 mt-2">
                      <Button
                        onClick={() =>
                          handleUpdateRanking(match.id, match.player1_id)
                        }
                        className="bg-primary hover:bg-blue-700"
                        disabled={isSelectingWinner === match.id}
                      >
                        {isSelectingWinner === match.id ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span>
                            Selecting...
                          </>
                        ) : (
                          `Select ${match.player1_username} as Winner`
                        )}
                      </Button>
                      <Button
                        onClick={() =>
                          handleUpdateRanking(match.id, match.player2_id)
                        }
                        className="bg-primary hover:bg-blue-700"
                        disabled={isSelectingWinner === match.id}
                      >
                        {isSelectingWinner === match.id ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span>
                            Selecting...
                          </>
                        ) : (
                          `Select ${match.player2_username} as Winner`
                        )}
                      </Button>
                    </div>
                  )}
                  {!match.winner_id && !match.player2_id && (
                    <p className="text-green-400 flex items-center mt-2">
                      <CheckCircle className="h-5 w-5 mr-1" />
                      Auto-advanced: {match.player1_username} (Bye)
                    </p>
                  )}
                </div>
              ))}
            {matches.every((m) => m.winner_id) && (
              <Button
                onClick={handleNextRound}
                className="mt-4 bg-primary"
                disabled={winners.length <= 1}
              >
                Start Next Round
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default RankingManagement;
