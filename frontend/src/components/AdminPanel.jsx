import { useState, useEffect } from "react";
import axios from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useNavigate } from "react-router-dom";
import TournamentCreation from "./TournamentCreation";
import UserList from "./UserList";
import ParticipantList from "./ParticipantList";
import TournamentControls from "./TournamentControls";
import BracketDisplay from "./BracketDisplay";
import RankingManagement from "./RankingManagement";

function AdminPanel() {
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [tournament, setTournament] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [matches, setMatches] = useState([]);
  const [byePlayer, setByePlayer] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
          setUser(storedUser);
          if (storedUser.profile_photo_url) {
            setPreview(storedUser.profile_photo_url);
          }
        }

        const token = localStorage.getItem("token");
        const [usersResponse, tournamentResponse] = await Promise.all([
          axios.get("/api/tournament/users", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/api/tournament/latest", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setAllUsers(usersResponse.data);
        setTournament(tournamentResponse.data.tournament);
        setParticipants(tournamentResponse.data.participants);
        setMatches(tournamentResponse.data.matches);
        setByePlayer(tournamentResponse.data.byePlayer);
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
      const response = await axios.post(
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      let updatedUser = user;

      if (profilePicFile) {
        const photoFormData = new FormData();
        photoFormData.append("profile_photo", profilePicFile);
        const photoUpdateResponse = await axios.post(
          `/api/user/${user.id}/photo`,
          photoFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        updatedUser = photoUpdateResponse.data.user;
      }

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      if (updatedUser.profile_photo_url) {
        setPreview(updatedUser.profile_photo_url);
      }
      setIsEditingProfile(false);
      setProfilePicFile(null);
      console.log("✅ AdminPanel: Profile picture updated successfully");
    } catch (error) {
      console.error(
        "❌ Failed to update profile picture:",
        error.response?.data || error.message
      );
    } finally {
      setIsLoading(false);
    }
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
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-900 to-black">
      <div className="max-w-6xl mx-auto">
        {/* Admin Profile Section */}
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
                  <AvatarImage src={preview} alt={user.username} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white">
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold">{user.username}</p>
                  <p className="text-gray-400">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {isEditingProfile ? (
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <Input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-blue-700"
                    />
                    {preview && profilePicFile && (
                      <p className="text-sm text-green-400">
                        ✅ New photo selected
                      </p>
                    )}
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditingProfile(false);
                          setProfilePicFile(null);
                          setPreview(user.profile_photo_url);
                        }}
                        className="border-gray-600 hover:bg-gray-700"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-primary hover:bg-blue-700"
                      >
                        {isLoading ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span>
                            Saving...
                          </>
                        ) : (
                          "Save Photo"
                        )}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <Button
                    onClick={() => setIsEditingProfile(true)}
                    className="bg-primary hover:bg-blue-700"
                  >
                    ✏️ Change Profile Picture
                  </Button>
                )}
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-900"
                >
                  Logout
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

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

        {/* All Users */}
        <UserList users={allUsers} />

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
  );
}

export default AdminPanel;
