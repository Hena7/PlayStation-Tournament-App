import { useState, useEffect } from "react";
import api from "../lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { useNavigate } from "react-router-dom";
import TournamentCreation from "../components/TournamentCreation";
import ParticipantList from "../components/ParticipantList";
import TournamentControls from "../components/TournamentControls";
import BracketDisplay from "../components/BracketDisplay";
import RankingManagement from "../components/RankingManagement";
import Header from "../components/Header";
import Footer from "../components/Footer";
import UserProfile from "../components/UserProfile";

function AdminPanel() {
  const [allUsers, setAllUsers] = useState([]);
  const [tournament, setTournament] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [matches, setMatches] = useState([]);
  const [byePlayer, setByePlayer] = useState(null);
  const [user, setUser] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [usersResponse, tournamentResponse, userResponse] =
          await Promise.all([
            api.get("/api/tournament/users", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            api.get("/api/tournament/latest", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            api.get("/api/user/me", {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);
        setAllUsers(usersResponse.data);
        setTournament(tournamentResponse.data.tournament);
        setParticipants(tournamentResponse.data.participants);
        setMatches(tournamentResponse.data.matches);
        setByePlayer(tournamentResponse.data.byePlayer);
        setUser(userResponse.data);
        localStorage.setItem("user", JSON.stringify(userResponse.data));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleCreateTournament = (data) => {
    setTournament(data.tournament);
    setParticipants(data.participants);
    setMatches(data.matches);
    setByePlayer(data.byePlayer);
  };

  const handleCloseTournament = () => {
    setTournament({ ...tournament, is_open: false });
  };

  const handleResetTournament = () => {
    setTournament(null);
    setParticipants([]);
    setMatches([]);
    setByePlayer(null);
  };

  const handleStartTournament = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/api/tournament/start",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTournament(response.data.tournament);
      setParticipants(response.data.participants);
      setMatches(response.data.matches);
      setByePlayer(response.data.byePlayer);
    } catch (error) {
      console.error("Error starting tournament:", error);
    }
  };

  const handleUpdateMatches = (newMatches) => {
    setMatches(newMatches);
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!user) {
    return <div className="text-center py-8">Loading admin panel...</div>;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen p-8 bg-gradient-to-br from-blue-900 to-black">
        <div className="max-w-6xl mx-auto">
          {/* Admin Profile Section */}
          {showEditProfile ? (
            <UserProfile />
          ) : (
            <Card className="bg-gray-800 border-none mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-2">👑</span>
                  Admin Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16 border-2 border-primary">
                      <AvatarImage
                        src={user?.profile_photo_url}
                        alt={user?.username}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white">
                        {user?.username
                          ? user.username.charAt(0).toUpperCase()
                          : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-lg font-semibold">{user?.username}</p>
                      <p className="text-gray-400">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => setShowEditProfile(true)}
                      className="bg-primary hover:bg-blue-700"
                    >
                      ✏️ Edit Profile
                    </Button>
                    <Button
                      onClick={handleLogout}
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-900"
                    >
                      Logout
                    </Button>{" "}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {/* All Users */}

          <div
            onClick={() => navigate("/admin/users")}
            className="text-green-300 pl-6 mb-7 hover:scale-95 hover:cursor-pointer underline "
          >
            Show All Users
          </div>

          {/* Tournament Creation */}
          <TournamentCreation
            onCreate={handleCreateTournament}
            disabled={!!tournament}
          />

          {/* Tournament Controls */}
          <TournamentControls
            tournament={tournament}
            onClose={handleCloseTournament}
            onReset={handleResetTournament}
          />

          {/* Tournament Participants */}
          {tournament && (
            <ParticipantList
              participants={participants}
              maxPlayers={tournament.max_players}
            />
          )}

          {/* Start Tournament Button */}
          {tournament && participants.length > 0 && (
            <Card className="bg-gray-800 border-none mb-8">
              <CardHeader>
                <CardTitle>Start Tournament</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleStartTournament}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={matches.length > 0}
                >
                  Start Tournament
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Bye Player */}
          {byePlayer && (
            <Card className="bg-gray-800 border-none mb-8">
              <CardHeader>
                <CardTitle>Bye Player</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg">
                  <Avatar className="h-10 w-10 border-2 border-primary">
                    <AvatarImage
                      src={byePlayer.profile_photo_url}
                      alt={byePlayer.username}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white">
                      {byePlayer.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-semibold">
                    {byePlayer.username} (Advances to next round)
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tournament Bracket */}
          <BracketDisplay matches={matches} />

          {/* Manage Rankings */}
          {tournament && matches.length > 0 && (
            <RankingManagement
              tournament={tournament}
              matches={matches}
              participants={participants}
              onUpdate={handleUpdateMatches}
            />
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default AdminPanel;
