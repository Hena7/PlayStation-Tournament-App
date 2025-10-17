import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import axios from "axios";

function UserProfile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ username: "", email: "" });
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      setFormData({
        username: storedUser.username,
        email: storedUser.email,
      });
      // Use the full URL for displaying the image from the backend
      if (storedUser.profile_photo_url) {
        setPreview(`http://localhost:5000${storedUser.profile_photo_url}`);
      }
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      // Update text data
      const textUpdateResponse = await axios.put(
        `/api/users/${user.id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let updatedUser = textUpdateResponse.data.user;

      // Update profile photo if a new one was selected
      if (profilePicFile) {
        const photoFormData = new FormData();
        photoFormData.append("profile_photo", profilePicFile);
        const photoUpdateResponse = await axios.post(
          `/api/users/${user.id}/photo`,
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

      // Update state and localStorage with the final user object
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      if (updatedUser.profile_photo_url) {
        setPreview(`http://localhost:5000${updatedUser.profile_photo_url}`);
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl mx-auto text-white col-span-1 md:col-span-2">
      <h2 className="text-2xl font-bold mb-6">My Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center space-x-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={preview} alt={user.username} />
            <AvatarFallback className="bg-gray-700 text-gray-400 animate-pulse">
              {user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {isEditing && (
            <Input type="file" onChange={handleFileChange} accept="image/*" />
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="username">Username</label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            disabled={!isEditing}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email">Email</label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            disabled={!isEditing}
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          )}
        </div>
      </form>
    </div>
  );
}

export default UserProfile;
