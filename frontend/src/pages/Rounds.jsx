import { useState, useEffect } from "react";
import api from "../lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Trophy, ChevronLeft, ChevronRight } from "lucide-react";

function Rounds() {
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRound, setActiveRound] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const fetchRounds = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/api/tournament/latest", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const tournamentRounds = response.data.rounds || [];
        setRounds(tournamentRounds);
        if (tournamentRounds.length > 0) {
          setActiveRound(`round-${tournamentRounds[0].round_number}`);
        }
      } catch (error) {
        console.error("Error fetching rounds:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRounds();
  }, []);

  const scrollTabs = (direction) => {
    const container = document.getElementById("rounds-tabs-scroll");
    if (!container) return;
    const scrollAmount = 120;
    const newPos =
      direction === "left"
        ? Math.max(0, scrollPosition - scrollAmount)
        : scrollPosition + scrollAmount;
    container.scrollTo({ left: newPos, behavior: "smooth" });
    setScrollPosition(newPos);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-blue-900 via-purple-900 to-black">
        <div className="flex items-center justify-center h-64">
          <div className="text-white text-lg animate-pulse">
            Loading rounds...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gradient-to-br from-blue-900 to-black">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center mb-8">
          <Trophy className="h-8 w-8 text-yellow-400 mr-3 animate-pulse" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center">
            Tournament Rounds
          </h1>
        </div>

        {rounds.length === 0 ? (
          <Card className="bg-gray-800/90 backdrop-blur border-none shadow-2xl">
            <CardContent className="p-8 sm:p-12 text-center">
              <p className="text-gray-400 text-lg">No rounds available yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Mobile Scrollable Tabs */}
            <div className="lg:hidden relative">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollTabs("left")}
                  className="p-2 bg-gray-800/80 backdrop-blur rounded-full text-gray-300 hover:text-white hover:bg-gray-700 transition-all"
                  disabled={scrollPosition === 0}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div
                  id="rounds-tabs-scroll"
                  className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth px-1 py-2 flex-1"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {rounds.map((round) => (
                    <button
                      key={round.round_number}
                      onClick={() =>
                        setActiveRound(`round-${round.round_number}`)
                      }
                      className={`min-w-fit px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
                        ${
                          activeRound === `round-${round.round_number}`
                            ? "bg-primary text-white shadow-lg"
                            : "bg-gray-800/80 text-gray-300 hover:bg-gray-700 hover:text-white"
                        }`}
                    >
                      Round {round.round_number}
                      {round.is_completed && (
                        <span className="ml-1 text-green-400 text-xs">
                          Completed
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => scrollTabs("right")}
                  className="p-2 bg-gray-800/80 backdrop-blur rounded-full text-gray-300 hover:text-white hover:bg-gray-700 transition-all"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Desktop Tabs - Only visible on lg+ */}
            <div className="hidden lg:flex gap-3 flex-wrap">
              {rounds.map((round) => (
                <button
                  key={round.round_number}
                  onClick={() => setActiveRound(`round-${round.round_number}`)}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-all
                    ${
                      activeRound === `round-${round.round_number}`
                        ? "bg-primary text-white shadow-lg"
                        : "bg-gray-800/80 text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                >
                  Round {round.round_number}
                  {round.is_completed && (
                    <span className="ml-2 text-green-400 text-sm">
                      Completed
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Matches Content */}
            {rounds.map((round) => (
              <div
                key={round.round_number}
                className={`transition-all duration-300 ${
                  activeRound === `round-${round.round_number}`
                    ? "block"
                    : "hidden"
                }`}
              >
                <Card className="bg-gray-800/90 backdrop-blur border-none shadow-2xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl sm:text-2xl text-white flex items-center">
                      <div className="w-2 h-8 bg-primary rounded-full mr-3" />
                      Round {round.round_number} Matches
                      {round.is_completed && (
                        <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-900/50 text-green-300">
                          Completed
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    {round.matches.map((match) => (
                      <div
                        key={match.id}
                        className="group p-4 sm:p-5 bg-gradient-to-r from-gray-700/50 to-gray-700/30 rounded-xl border border-gray-600/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-center gap-3 sm:gap-4 flex-1">
                            {/* Player 1 */}
                            <div className="flex items-center gap-2 sm:gap-3 flex-1">
                              <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-primary/50 group-hover:ring-primary transition-all">
                                <AvatarImage
                                  src={match.player1_avatar_url}
                                  alt={match.player1_username}
                                />
                                <AvatarFallback className="bg-primary text-white text-sm sm:text-base">
                                  {match.player1_username
                                    ?.charAt(0)
                                    .toUpperCase() || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-bold text-white truncate text-sm sm:text-base">
                                  {match.player1_username || "Unknown"}
                                </p>
                                {match.winner_username ===
                                  match.player1_username && (
                                  <p className="text-xs text-green-400 font-medium">
                                    Winner
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-center px-2">
                              <span className="text-gray-500 text-xs sm:text-sm font-bold">
                                VS
                              </span>
                            </div>

                            {/* Player 2 or Bye */}
                            {match.player2_username ? (
                              <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end sm:justify-start">
                                <div className="min-w-0 text-right sm:text-left">
                                  <p className="font-bold text-white truncate text-sm sm:text-base">
                                    {match.player2_username}
                                  </p>
                                  {match.winner_username ===
                                    match.player2_username && (
                                    <p className="text-xs text-green-400 font-medium">
                                      Winner
                                    </p>
                                  )}
                                </div>
                                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-primary/50 group-hover:ring-primary transition-all">
                                  <AvatarImage
                                    src={match.player2_avatar_url}
                                    alt={match.player2_username}
                                  />
                                  <AvatarFallback className="bg-primary text-white text-sm sm:text-base">
                                    {match.player2_username
                                      ?.charAt(0)
                                      .toUpperCase() || "?"}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 flex-1 justify-center sm:justify-end">
                                <div className="text-center sm:text-right">
                                  <p className="text-blue-400 font-bold text-sm sm:text-base">
                                    Bye Pass
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    Auto-advance
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Result */}
                          <div className="text-center sm:text-right">
                            {match.winner_username ? (
                              <div className="inline-flex items-center gap-2 bg-green-900/30 px-3 py-1.5 rounded-full">
                                <Trophy className="h-4 w-4 text-green-400" />
                                <span className="text-green-400 font-semibold text-sm">
                                  {match.winner_username} Won
                                </span>
                              </div>
                            ) : match.player2_username ? (
                              <span className="inline-block px-4 py-1.5 bg-yellow-900/30 text-yellow-400 rounded-full text-sm font-medium">
                                Pending
                              </span>
                            ) : null}
                            {match.score && (
                              <p className="text-gray-400 text-xs mt-1">
                                {match.score}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Rounds;
