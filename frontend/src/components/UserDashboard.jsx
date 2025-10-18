import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

function UserDashboard() {
  const [user, setUser] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [matches, setMatches] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
          setUser(storedUser);
        }

        const token = localStorage.getItem("token");
        const [rankingsRes, matchesRes, notificationsRes] = await Promise.all([
          axios.get("/api/ranking", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          // Fetch matches specific to the logged-in user
          axios.get("/api/user/matches", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/api/notifications", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setRankings(rankingsRes.data);
        setMatches(matchesRes.data);
        setNotifications(notificationsRes.data);
      } catch (error) {
        console.error("Dashboard error:", error);
      }
    };
    fetchData();
  }, []);

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
        {/* User Profile Section */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            {/* User Info */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16 border-2 border-primary">
                <AvatarImage src={user.profile_photo_url} alt={user.username} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{user.username}</h2>
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

        {/* Notifications Section */}
        <Card className="bg-gray-800 border-none mb-8">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <p>No notifications.</p>
            ) : (
              notifications.map((n) => (
                <p key={n.id} className="text-sm text-blue-300">
                  {n.message}
                </p>
              ))
            )}
          </CardContent>
        </Card>
        {/* Rankings and Matches */}
        <h1 className="text-4xl font-bold mb-8 text-center">User Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gray-800 border-none">
            <CardHeader>
              <CardTitle>Your Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              {rankings.length === 0 ? (
                <p>No rankings yet.</p>
              ) : (
                rankings.map((ranking) => (
                  <p key={ranking.id}>
                    Tournament: {ranking.tournament_id} - Rank: {ranking.rank}
                  </p>
                ))
              )}
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-none">
            <CardHeader>
              <CardTitle>Match History</CardTitle>
            </CardHeader>
            <CardContent>
              {matches.length === 0 ? (
                <p>No matches yet.</p>
              ) : (
                matches.map((match) => (
                  <p key={match.id}>
                    Round {match.round}: {match.player1_id} vs{" "}
                    {match.player2_id} - Winner: {match.winner_id || "Pending"}
                  </p>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
