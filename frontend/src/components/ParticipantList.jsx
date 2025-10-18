import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

function ParticipantList({ participants, maxPlayers }) {
  return (
    <Card className="bg-gray-800 border-none mb-8">
      <CardHeader>
        <CardTitle>
          Tournament Participants ({participants.length}/{maxPlayers})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {participants.length === 0 ? (
          <p>No participants yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {participants.map((p) => (
              <div
                key={p.id}
                className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg"
              >
                <Avatar className="h-10 w-10 border-2 border-primary">
                  <AvatarImage src={p.profile_photo_url} alt={p.username} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white">
                    {p.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <p className="font-semibold">
                  {p.username} (Applied:{" "}
                  {new Date(p.applied_at).toLocaleString()})
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ParticipantList;
