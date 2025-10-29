import { useState, useEffect } from "react";
import api from "../lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

function Rounds() {
  const [rounds, setRounds] = useState([]);
  const [expandedRounds, setExpandedRounds] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRounds = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/api/tournament/latest", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const tournament = response.data.tournament;
        const matches = response.data.matches;

        if (tournament && matches.length > 0) {
          // Group matches by round
          const roundsMap = {};
          matches.forEach((match) => {
            const roundNum = match.round;
            if (!roundsMap[roundNum]) {
              roundsMap[roundNum] = [];
            }
            roundsMap[roundNum].push(match);
          });

          const roundsArray = Object.keys(roundsMap).map((roundNum) => ({
            round_number: parseInt(roundNum),
            matches: roundsMap[roundNum],
            is_completed: roundsMap[roundNum].every((m) => m.winner_id),
          }));

          setRounds(
            roundsArray.sort((a, b) => a.round_number - b.round_number)
          );
        }
      } catch (error) {
        console.error("Error fetching rounds:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRounds();
  }, []);

  const toggleRound = (roundNumber) => {
    setExpandedRounds((prev) => ({
      ...prev,
      [roundNumber]: !prev[roundNumber],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-blue-900 to-black">
        <div className="text-center py-8 text-white">Loading rounds...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-900 to-black">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          Tournament Rounds
        </h1>

        {rounds.length === 0 ? (
          <Card className="bg-gray-800 border-none">
            <CardContent className="p-8 text-center">
              <p className="text-gray-400">No rounds available yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {rounds.map((round) => (
              <Card
                key={round.round_number}
                className="bg-gray-800 border-none"
              >
                <CardHeader>
                  <CardTitle
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleRound(round.round_number)}
                  >
                    <span className="text-white">
                      Round {round.round_number}
                      {round.is_completed && (
                        <span className="ml-2 text-green-400">(Completed)</span>
                      )}
                    </span>
                    <Button variant="ghost" size="sm">
                      {expandedRounds[round.round_number] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>
                {expandedRounds[round.round_number] && (
                  <CardContent>
                    <div className="space-y-4">
                      {round.matches.map((match) => (
                        <div
                          key={match.id}
                          className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-10 w-10 border-2 border-primary">
                              <AvatarImage
                                src={match.player1_avatar_url}
                                alt={match.player1_username}
                              />
                              <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white">
                                {match.player1_username
                                  ? match.player1_username
                                      .charAt(0)
                                      .toUpperCase()
                                  : "?"}
                              </AvatarFallback>
                            </Avatar>
                            <p className="font-semibold text-white">
                              {match.player1_username || "Unknown"}
                            </p>
                            <span className="text-gray-400">vs</span>
                            <Avatar className="h-10 w-10 border-2 border-primary">
                              <AvatarImage
                                src={match.player2_avatar_url}
                                alt={match.player2_username}
                              />
                              <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white">
                                {match.player2_username
                                  ? match.player2_username
                                      .charAt(0)
                                      .toUpperCase()
                                  : "?"}
                              </AvatarFallback>
                            </Avatar>
                            <p className="font-semibold text-white">
                              {match.player2_username || "Unknown"}
                            </p>
                          </div>
                          <div className="text-right">
                            {match.winner_username ? (
                              <div>
                                <p className="text-green-400 font-semibold">
                                  Winner: {match.winner_username}
                                </p>
                                {match.score && (
                                  <p className="text-gray-400 text-sm">
                                    Score: {match.score}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-yellow-400">Pending</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Rounds;
