import { useState, useEffect } from "react";
import api from "../lib/api";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Trophy, RefreshCw } from "lucide-react";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/api/ranking/leaderboard");
      setLeaderboard(response.data);
    } catch (err) {
      setError("Failed to load leaderboard");
      console.error("Error fetching leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return "gold";
      case 2:
        return "silver";
      case 3:
        return "bronze";
      default:
        return `${rank}th`;
    }
  };

  const getRankStyle = (rank) => {
    switch (rank) {
      case 1:
        return "from-yellow-400 to-yellow-600 text-white shadow-yellow-500/50";
      case 2:
        return "from-gray-400 to-gray-600 text-white shadow-gray-500/50";
      case 3:
        return "from-orange-400 to-orange-600 text-white shadow-orange-500/50";
      default:
        return "bg-gray-700 text-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-black">
        <Header />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-white text-lg animate-pulse">
              Loading leaderboard...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-black">
        <Header />
        <div className="flex-1 flex items-center justify-center py-20 px-4">
          <div className="text-center max-w-md">
            <p className="text-red-400 text-xl mb-4">{error}</p>
            <button
              onClick={fetchLeaderboard}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="h-5 w-5" />
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-black">
      <Header />
      <div className="flex-1 px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Trophy className="h-10 w-10 text-yellow-400 animate-pulse" />
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                Leaderboard
              </h1>
            </div>
            <p className="text-gray-300 text-lg">
              See how you rank against other players!
            </p>
          </div>

          {leaderboard.length === 0 ? (
            <div className="bg-gray-800/90 backdrop-blur rounded-2xl shadow-2xl p-12 text-center">
              <p className="text-gray-400 text-lg">No players found.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block bg-gray-800/90 backdrop-blur rounded-2xl shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-900 to-gray-800">
                        <th className="px-6 py-5 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="px-6 py-5 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                          Player
                        </th>
                        <th className="px-6 py-5 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                          Games
                        </th>
                        <th className="px-6 py-5 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                          Wins
                        </th>
                        <th className="px-6 py-5 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                          Losses
                        </th>
                        <th className="px-6 py-5 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                          Byes
                        </th>
                        <th className="px-6 py-5 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                          Win Rate
                        </th>
                        <th className="px-6 py-5 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                          Score
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {leaderboard.map((player, idx) => (
                        <tr
                          key={player.id}
                          className={`hover:bg-gray-700/50 transition-all duration-300 ${
                            idx < 3
                              ? "bg-gradient-to-r from-yellow-900/20 to-transparent"
                              : ""
                          }`}
                        >
                          <td className="px-6 py-5">
                            <div
                              className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-lg font-bold bg-gradient-to-br ${getRankStyle(
                                player.rank
                              )} shadow-lg`}
                            >
                              {getRankIcon(player.rank)}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              {player.profile_photo_url ? (
                                <img
                                  className="h-12 w-12 rounded-full ring-2 ring-primary/50"
                                  src={`http://localhost:5000${player.profile_photo_url}`}
                                  alt={player.username}
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
                                  {player.username[0].toUpperCase()}
                                </div>
                              )}
                              <span className="text-white font-semibold text-lg">
                                {player.username}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-gray-300 font-medium">
                            {player.gamesPlayed}
                          </td>
                          <td className="px-6 py-5 text-green-400 font-bold">
                            {player.wins}
                          </td>
                          <td className="px-6 py-5 text-red-400 font-medium">
                            {player.losses}
                          </td>
                          <td className="px-6 py-5 text-blue-400 font-medium">
                            {player.byes || 0}
                          </td>
                          <td className="px-6 py-5 text-cyan-300 font-bold">
                            {player.winRate}
                          </td>
                          <td className="px-6 py-5 text-yellow-300 font-bold text-xl">
                            {player.rankScore}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4">
                {leaderboard.map((player, idx) => (
                  <div
                    key={player.id}
                    className={`bg-gray-800/90 backdrop-blur rounded-2xl p-5 shadow-xl border border-gray-700 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                      idx < 3 ? "ring-2 ring-yellow-500/30" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold bg-gradient-to-br ${getRankStyle(
                          player.rank
                        )} shadow-lg`}
                      >
                        {getRankIcon(player.rank)}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-yellow-300">
                          {player.rankScore}
                        </p>
                        <p className="text-xs text-gray-400">Score</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      {player.profile_photo_url ? (
                        <img
                          className="h-14 w-14 rounded-full ring-2 ring-primary/50"
                          src={`http://localhost:5000${player.profile_photo_url}`}
                          alt={player.username}
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">
                          {player.username[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="text-white font-bold text-lg">
                          {player.username}
                        </h3>
                        <p className="text-cyan-300 text-sm">
                          {player.winRate} Win Rate
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <p className="text-2xl font-bold text-green-400">
                          {player.wins}
                        </p>
                        <p className="text-xs text-gray-400">Wins</p>
                      </div>
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <p className="text-2xl font-bold text-red-400">
                          {player.losses}
                        </p>
                        <p className="text-xs text-gray-400">Losses</p>
                      </div>
                      <div className="bg-gray-700/50 rounded-lg p-3">
                        <p className="text-2xl font-bold text-blue-400">
                          {player.byes || 0}
                        </p>
                        <p className="text-xs text-gray-400">Byes</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="mt-10 text-center">
            <button
              onClick={fetchLeaderboard}
              className="bg-primary text-white px-8 py-3 rounded-full hover:shadow-xl hover:shadow-primary/40 transition-all flex items-center gap-3 mx-auto text-lg font-semibold"
            >
              <RefreshCw className="h-5 w-5 active:animate-spin" />
              Refresh Leaderboard
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Leaderboard;
