import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

function UserList({ users }) {
  return (
    <Card className="bg-gray-800 border-none mb-8">
      <CardHeader>
        <CardTitle>All Users</CardTitle>
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
