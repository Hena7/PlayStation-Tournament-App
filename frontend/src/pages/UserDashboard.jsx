import { useState, useEffect } from "react";
import api from "../lib/api";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { Bell, Trophy, AlertCircle } from "lucide-react";
import TournamentApplication from "../components/TournamentApplication";

function UserDashboard() {
  const [user, setUser] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
          setUser(storedUser);
        }
        const token = localStorage.getItem("token");
        // Fetch latest tournament to get tournamentId
        const tournamentRes = await api.get("/api/tournament/latest", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const tournament = tournamentRes.data.tournament;
        const matches = tournamentRes.data.matches;
        const promises = [
          api.get("/api/ranking", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/api/notifications", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ];
        const [rankingsRes, notificationsRes] = await Promise.all(promises);
        setRankings(rankingsRes.data);
        setNotifications(notificationsRes.data);
        setMatches(tournament ? matches : []);
      } catch (error) {
        console.error("Dashboard error:", error);
        setError("Failed to load dashboard data. Please try again later.");
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 90000);
    return () => clearInterval(interval);
  }, []);

  const handleApply = () => {
    // Refresh notifications after applying
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(response.data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setError("Failed to load notifications. Please try again.");
      }
    };
    fetchNotifications();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!user) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-900 to-black">
      <div className="max-w-4xl mx-auto">
        {/* Error Message */}
        {error && (
          <Card className="bg-red-900 border-none mb-8">
            <CardContent className="flex items-center p-4">
              <AlertCircle className="h-5 w-5 mr-2 text-white" />
              <p className="text-white">{error}</p>
            </CardContent>
          </Card>
        )}
        {/* User Profile Section */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            {/* User Info */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16 border-2 border-primary">
                <AvatarImage src={user.avatar_url} alt={user.username} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-semibold">{user.username}</p>
                <p className="text-gray-400">{user.email}</p>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex items-center space-x-2 pt-4 sm:pt-0">
              <Button
                onClick={() => navigate("/profile")}
                className="bg-primary hover:bg-blue-700 flex-1 sm:flex-initial"
              >
                Edit Profile
              </Button>
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="flex-1 sm:flex-initial bg-red-600 hover:bg-red-900"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
        {/* Tournament Application */}
        <TournamentApplication userId={user.id} onApply={handleApply} />
        {/* Notifications Section */}
        <Card className="bg-gray-800 border-none mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <p>No notifications.</p>
            ) : (
              <div className="space-y-2">
                {notifications.map((n) => (
                  <p
                    key={n.id}
                    className="text-sm text-blue-300 p-2 bg-gray-700 rounded"
                  >
                    {n.message}{" "}
                    <span className="text-gray-500 text-xs">
                      ({new Date(n.created_at).toLocaleString()})
                    </span>
                  </p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        {/* Rankings Section */}
        <Card className="bg-gray-800 border-none mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              Your Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rankings.length === 0 ? (
              <p>No rankings yet.</p>
            ) : (
              <div className="space-y-4">
                {rankings.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg"
                  >
                    <p className="font-semibold">
                      {r.tournament_name}
                      {/* <span className="text-gray-500 text-xs">
                        ({new Date(r.created_at).toLocaleString()})
                      </span> */}
                      : Rank {r.rank}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        {/* Current Matches Section */}
        <Card className="bg-gray-800 border-none">
          <CardHeader>
            <CardTitle>Your Matches</CardTitle>
          </CardHeader>
          <CardContent>
            {matches.length === 0 ? (
              <p>No matches yet.</p>
            ) : (
              <div className="space-y-4">
                {matches
                  .filter(
                    (m) => m.player1_id === user.id || m.player2_id === user.id
                  )
                  .map((m) => (
                    <div key={m.id} className="p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        {/* Player 1 Avatar */}
                        <Avatar className="h-10 w-10 border-2 border-primary">
                          <AvatarImage
                            src={m.player1_avatar_url}
                            alt={m.player1_username}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white">
                            {m.player1_username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <p className="font-semibold">{m.player1_username}</p>
                        <span>vs</span>
                        {/* Player 2 Avatar or Bye */}
                        {m.player2_id ? (
                          <Avatar className="h-10 w-10 border-2 border-primary">
                            <AvatarImage
                              src={m.player2_avatar_url}
                              alt={m.player2_username}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white">
                              {m.player2_username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <span>Bye</span>
                        )}
                        {m.player2_id && (
                          <p className="font-semibold">{m.player2_username}</p>
                        )}
                        {m.winner_username && (
                          <span className="text-green-400 ml-2">
                            (Winner: {m.winner_username})
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-2">
                        Round {m.round}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default UserDashboard;
