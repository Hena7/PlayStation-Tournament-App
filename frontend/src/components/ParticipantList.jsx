import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

function ParticipantList({ participants, maxPlayers }) {
  // Safely format applied_at values. Handles numeric timestamps, ISO strings,
  // and missing/invalid values. Returns 'Unknown' when the value can't be parsed.
  const formatAppliedAt = (raw) => {
    if (raw === null || raw === undefined || raw === "") return "Unknown";
    // If it's a numeric string (unix ms or seconds) or a number, try to coerce.
    let dateObj;
    if (typeof raw === "number" || /^\d+$/.test(String(raw))) {
      // If it's in seconds (10 digits), convert to ms.
      const num = Number(raw);
      dateObj = new Date(
        num < 1e12 && String(num).length <= 10 ? num * 1000 : num
      );
    } else {
      dateObj = new Date(raw);
    }
    if (Number.isNaN(dateObj.getTime())) return "Unknown";
    return dateObj.toLocaleString();
  };
  return (
    <Card className="bg-gray-800 border-none mb-8">
      <CardHeader>
        <CardTitle>
          Tournament Participants ({participants?.length || 0}/{maxPlayers})
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
                    {p.username && p.username.charAt
                      ? p.username.charAt(0).toUpperCase()
                      : "?"}
                  </AvatarFallback>
                </Avatar>
                <p className="font-semibold">
                  {p.username} (Applied: {formatAppliedAt(p.applied_at)})
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
