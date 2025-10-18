import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

function AdminPanel() {
  const [user, setUser] = useState(null);
  const [participantsCount, setParticipantsCount] = useState(10);
  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user data and initialize profile picture preview
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      if (storedUser.profile_photo_url) {
        setPreview(storedUser.profile_photo_url);
      }
    }
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
      setTournament(response.data);
    } catch (error) {
      console.error("Error creating tournament:", error);
    }
  };

  const handleUpdateRanking = async (userId, rank) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/ranking",
        { user_id: userId, tournament_id: tournament.id, rank },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRankings([...rankings, { user_id: userId, rank }]);
    } catch (error) {
      console.error("Error updating ranking:", error);
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

      // Update profile photo if selected
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

      // Update state and localStorage
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

  if (!user) {
    return <div className="text-center py-8">Loading admin panel...</div>;
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-900 to-black">
      <div className="max-w-4xl mx-auto">
        {/* Admin Profile Section */}
        <Card className="bg-gray-800 border-none mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2">👑</span>
              Admin Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-6">
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
            {isEditingProfile ? (
              <form onSubmit={handleProfileSubmit} className="mt-4 space-y-4">
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
                <div className="flex justify-end space-x-4">
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
                className="mt-4 bg-primary hover:bg-blue-700"
              >
                ✏️ Change Profile Picture
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Tournament Creation Section */}
        <Card className="bg-gray-800 border-none mb-6">
          <CardHeader>
            <CardTitle>Create Tournament</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="number"
              placeholder="Number of participants (10 or 50)"
              value={participantsCount}
              onChange={(e) => setParticipantsCount(Number(e.target.value))}
              className="mb-4"
            />
            <Button
              onClick={handleCreateTournament}
              className="bg-primary hover:bg-blue-700"
            >
              Create Tournament
            </Button>
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
              matches.map((match) => (
                <div key={match.id} className="mb-4">
                  <p>
                    Round {match.round}: {match.player1_id} vs{" "}
                    {match.player2_id}
                  </p>
                  <Input
                    type="number"
                    placeholder="Winner ID"
                    onChange={(e) =>
                      handleUpdateRanking(
                        Number(e.target.value),
                        matches.length - match.round + 1
                      )
                    }
                    className="mt-2"
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminPanel;
