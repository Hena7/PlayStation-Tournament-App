import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

function BracketDisplay({ matches }) {
  const generateBracket = () => {
    const maxRound = Math.max(...matches.map((m) => m.round), 0);
    const rounds = [];
    for (let round = 1; round <= maxRound; round++) {
      const roundMatches = matches.filter((m) => m.round === round);
      rounds.push({ round, matches: roundMatches });
    }
    return rounds;
  };

  return (
    <Card className="bg-gray-800 border-none mb-8">
      <CardHeader>
        <CardTitle>Tournament Bracket</CardTitle>
      </CardHeader>
      <CardContent>
        {matches.length === 0 ? (
          <p>No matches to display in bracket.</p>
        ) : (
          <div className="space-y-6">
            {generateBracket().map((round) => (
              <div key={round.round} className="border-l-4 border-primary pl-4">
                <h4 className="text-lg font-semibold mb-2">
                  Round {round.round}
                </h4>
                <div className="space-y-4">
                  {round.matches.map((match) => (
                    <div
                      key={match.id}
                      className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <p>
                          {match.player1_username || "Unknown"} vs{" "}
                          {match.player2_username || "Bye"}
                          {match.winner_username && (
                            <span className="text-green-400 ml-2">
                              (Winner: {match.winner_username})
                            </span>
                          )}
                          {match.score && (
                            <span className="text-gray-400 ml-2">
                              Score: {match.score}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default BracketDisplay;
