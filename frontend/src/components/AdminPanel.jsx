import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

function AdminPanel() {
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [participantsCount, setParticipantsCount] = useState(10);
  const [tournament, setTournament] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [matches, setMatches] = useState([]);
  const [byePlayer, setByePlayer] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSelectingWinner, setIsSelectingWinner] = useState(null);
  const navigate = useNavigate();

  // Fetch user data and all users
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
        const usersResponse = await axios.get("/api/tournament/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllUsers(usersResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Fetch matches when tournament changes
  useEffect(() => {
    const fetchMatches = async () => {
      if (tournament) {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(
            `/api/tournament/${tournament.id}/matches`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setMatches(response.data);
        } catch (error) {
          console.error("Error fetching matches:", error);
        }
      }
    };
    fetchMatches();
  }, [tournament]);

  const handleCreateTournament = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/tournament/create",
        {
          name: `Tournament ${new Date().toISOString()}`,
          count: participantsCount,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTournament(response.data.tournament);
      setParticipants(response.data.participants);
      setMatches(response.data.matches);
      setByePlayer(response.data.byePlayer);
    } catch (error) {
      console.error("Error creating tournament:", error);
    }
  };

  const handleNextRound = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `/api/tournament/${tournament.id}/next-round`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMatches((prevMatches) => [...prevMatches, ...response.data.matches]);
      setByePlayer(response.data.byePlayer);
    } catch (error) {
      console.error("Error creating next round:", error);
    }
  };

  const handleUpdateRanking = async (matchId, winnerId) => {
    setIsSelectingWinner(matchId);
    try {
      const token = localStorage.getItem("token");
      const match = matches.find((m) => m.id === matchId);
      // Post to rankings
      await axios.post(
        "/api/ranking",
        { user_id: winnerId, tournament_id: tournament.id, rank: match.round },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update match winner
      await axios.put(
        `/api/tournament/matches/${matchId}`,
        { winner_id: winnerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh matches
      const response = await axios.get(
        `/api/tournament/${tournament.id}/matches`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMatches(response.data);
      setRankings([...rankings, { user_id: winnerId, rank: match.round }]);
    } catch (error) {
      console.error("Error updating ranking:", error);
    } finally {
      setIsSelectingWinner(null);
    }
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

  // Generate bracket visualization
  const generateBracket = () => {
    const maxRound = Math.max(...matches.map((m) => m.round), 0);
    const rounds = [];
    for (let round = 1; round <= maxRound; round++) {
      const roundMatches = matches.filter((m) => m.round === round);
      rounds.push({ round, matches: roundMatches });
    }
    return rounds;
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

        {/* All Users Section */}
        <Card className="bg-gray-800 border-none mb-8">
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            {allUsers.length === 0 ? (
              <p>No users found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {allUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg"
                  >
                    <Avatar className="h-12 w-12 border-2 border-primary">
                      <AvatarImage src={u.profile_photo_url} alt={u.username} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white">
                        {u.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{u.username}</p>
                      <p className="text-sm text-gray-400">{u.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tournament Creation Section */}
        <Card className="bg-gray-800 border-none mb-8">
          <CardHeader>
            <CardTitle>Create Tournament</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="number"
                placeholder="Number of participants (e.g., 10 or 50)"
                value={participantsCount}
                onChange={(e) => setParticipantsCount(Number(e.target.value))}
                className="w-full max-w-xs"
                min={2}
                max={50}
              />
              <Button
                onClick={handleCreateTournament}
                className="bg-primary hover:bg-blue-700"
              >
                Create Tournament
              </Button>
            </div>
            {participants.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">
                  Selected Participants
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {participants.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg"
                    >
                      <Avatar className="h-10 w-10 border-2 border-primary">
                        <AvatarImage
                          src={p.profile_photo_url}
                          alt={p.username}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white">
                          {p.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <p className="font-semibold">{p.username}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {matches.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Round 1 Matches</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {matches
                    .filter((m) => m.round === 1)
                    .map((match) => (
                      <div
                        key={match.id}
                        className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-10 w-10 border-2 border-primary">
                            <AvatarImage
                              src={
                                participants.find(
                                  (p) => p.id === match.player1_id
                                )?.profile_photo_url
                              }
                              alt={match.player1_username}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white">
                              {match.player1_username?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <p>{match.player1_username}</p>
                        </div>
                        <span>vs</span>
                        {match.player2_id ? (
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-10 w-10 border-2 border-primary">
                              <AvatarImage
                                src={
                                  participants.find(
                                    (p) => p.id === match.player2_id
                                  )?.profile_photo_url
                                }
                                alt={match.player2_username}
                              />
                              <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white">
                                {match.player2_username
                                  ?.charAt(0)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <p>{match.player2_username}</p>
                          </div>
                        ) : (
                          <p>Bye</p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
            {byePlayer && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Bye Player</h3>
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
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tournament Bracket Section */}
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
                  <div
                    key={round.round}
                    className="border-l-4 border-primary pl-4"
                  >
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
                              {match.player1_username} vs{" "}
                              {match.player2_username || "Bye"}
                              {match.winner_username && (
                                <span className="text-green-400 ml-2">
                                  (Winner: {match.winner_username})
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

        {/* Manage Rankings Section */}
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
                    className="mt-4 bg-primary hover:bg-blue-700"
                  >
                    Start Next Round
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminPanel;
