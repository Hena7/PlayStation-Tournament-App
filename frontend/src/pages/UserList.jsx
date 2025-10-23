import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function UserList() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const usersResponse = await axios.get("/api/tournament/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(usersResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);
  return (
    <Card className="bg-gray-800 border-none mb-8">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>All Users</CardTitle>
          <p
            onClick={() => navigate("/admin")}
            className="text-green-300 underline hover:scale-105 hover:cursor-pointer"
          >
            Back To Admin Dashboard
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {users.map((u) => (
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
  );
}

export default UserList;
