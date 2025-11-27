import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import api from "../lib/api";

function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions (max 800px width/height, maintain aspect ratio)
      const maxSize = 800;
      let { width, height } = img;

      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress the image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to base64 with compression (0.8 quality for JPEG)
      const compressedBase64 = canvas.toDataURL("image/jpeg", 0.8);
      resolve(compressedBase64);
    };

    img.onerror = (error) => reject(error);
    img.src = URL.createObjectURL(file);
  });
}

function UserProfile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ username: "", email: "" });
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    console.log(
      "UserProfile: Component mounted. Checking for user in localStorage."
    );
    const storedUser = JSON.parse(localStorage.getItem("user"));
    console.log("UserProfile: Found user in localStorage:", storedUser);
    if (storedUser) {
      setUser(storedUser);
      setFormData({
        username: storedUser.username,
        email: storedUser.email,
      });
      if (storedUser.profile_photo_url) {
        setPreview(storedUser.profile_photo_url);
      }
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log("UserProfile: File selected:", file?.name);
    setErrorMessage(""); // Clear previous error messages

    if (file) {
      // Check file size (5 MB limit)
      const maxSize = 5 * 1024 * 1024; // 5 MB in bytes
      if (file.size > maxSize) {
        setErrorMessage("File size should be smaller than 5 MB");
        e.target.value = ""; // Clear the file input
        return;
      }

      // Check file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage("Only image files are allowed!");
        e.target.value = ""; // Clear the file input
        return;
      }

      setProfilePicFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    console.log("UserProfile: handleSubmit triggered.");
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      console.log("UserProfile: Submitting text data:", formData);

      // Update text data
      const textUpdateResponse = await api.put(
        `/api/user/${user.id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("UserProfile: Text update success:", textUpdateResponse.data);

      let updatedUser = textUpdateResponse.data.user;

      // Update profile photo if selected
      if (profilePicFile) {
        const base64 = await convertToBase64(profilePicFile);
        const photoUpdateResponse = await api.put(
          `/api/user/${user.id}/photo`,
          { photo_base64: base64 },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(
          "UserProfile: Photo update success:",
          photoUpdateResponse.data
        );
        updatedUser = photoUpdateResponse.data.user;
      }

      // Update state and localStorage
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      if (updatedUser.profile_photo_url) {
        setPreview(updatedUser.profile_photo_url);
      }

      // ✅ VISUAL FEEDBACK: Show success and exit edit mode
      setIsEditing(false);
      setProfilePicFile(null); // Reset file input
      console.log(
        "✅ UserProfile: SUCCESS - Profile updated and edit mode OFF"
      );
    } catch (error) {
      console.error(
        "❌ Failed to update profile:",
        error.response?.data || error.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div className="text-center py-8">Loading profile...</div>;
  }

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl mx-auto text-white">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <span className="mr-2">👤</span>
        My Profile
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* PROFILE PHOTO SECTION */}
        <div className="flex items-center space-x-6">
          <Avatar className="h-24 w-24 border-2 border-primary">
            <AvatarImage src={preview} alt={user.username} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white">
              {user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {isEditing && (
            <div className="space-y-2">
              <Input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="file:mr-4 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-blue-700 active:scale-95 hover:scale-105 "
              />
              {preview && profilePicFile && (
                <p className="text-sm text-green-400">✅ New photo selected</p>
              )}
            </div>
          )}
        </div>

        {/* USERNAME FIELD */}
        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-medium">
            Username
          </label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            disabled={!isEditing}
            className={`${
              isEditing
                ? "border-primary bg-gray-700 focus:ring-primary"
                : "bg-gray-700 border-gray-600 cursor-not-allowed"
            }`}
            placeholder={isEditing ? "Enter new username" : "Username"}
          />
        </div>

        {/* EMAIL FIELD */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            disabled={!isEditing}
            className={`${
              isEditing
                ? "border-primary bg-gray-700 focus:ring-primary"
                : "bg-gray-700 border-gray-600 cursor-not-allowed"
            }`}
            placeholder={isEditing ? "Enter new email" : "Email"}
          />
        </div>

        {/* BUTTONS */}
        <div className="flex justify-end space-x-4 pt-4">
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setProfilePicFile(null);
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
                  "Save Changes"
                )}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => {
                setIsEditing(true);
                console.log("✅ UserProfile: Edit mode ACTIVATED");
              }}
              className="bg-primary hover:bg-blue-700 w-full md:w-auto"
            >
              ✏️ Edit Profile
            </Button>
          )}
        </div>

        {/* ERROR MESSAGE */}
        {errorMessage && (
          <div className="p-3 bg-red-900/30 border border-red-500 rounded-md text-red-300 text-sm">
            ❌ {errorMessage}
          </div>
        )}

        {/* VISUAL STATUS INDICATOR */}
        {isEditing && (
          <div className="p-3 bg-blue-900/30 border border-blue-500 rounded-md text-blue-300 text-sm">
            ✏️ Editing mode active - make your changes and click "Save Changes"
          </div>
        )}
      </form>
    </div>
  );
}

export default UserProfile;
