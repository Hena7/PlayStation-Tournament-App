import { useState, useEffect } from "react";
import axios from "../lib/api";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { UserPlus, AlertCircle } from "lucide-react";

function TournamentApplication({ userId, onApply }) {
  const [tournament, setTournament] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/tournament/latest", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTournament(response.data.tournament);
        setHasApplied(response.data.participants.some((p) => p.id === userId));
      } catch (error) {
        console.error("Error fetching tournament:", error);
        setError("Failed to load tournament data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTournament();
    const interval = setInterval(fetchTournament, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [userId]);

  const handleApply = async () => {
    setIsApplying(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/tournament/apply",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHasApplied(true);
      onApply();
    } catch (error) {
      console.error("Error applying to tournament:", error);
      setError(
        error.response?.data?.message || "Failed to apply. Please try again."
      );
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Card className="bg-gray-800 border-none mb-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <UserPlus className="h-5 w-5 mr-2" />
          Tournament Application
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-gray-400 flex items-center">
            <span className="animate-spin mr-2">⏳</span>
            Loading tournament data...
          </p>
        ) : error ? (
          <p className="text-red-400 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </p>
        ) : !tournament ? (
          <p className="text-gray-400">No active tournament available.</p>
        ) : (
          <div>
            <p className="mb-4">
              Tournament:{" "}
              <span className="font-semibold">{tournament.name}</span>
              <br />
              Status:
              <span
                className={`inline-block px-2 py-1   ${
                  tournament.is_open ? " text-green-500" : "text-red-500"
                }`}
              >
                {tournament.is_open ? "Open" : "Closed"}
              </span>
              <br />
              Participants: {tournament.participant_count || 0}/
              {tournament.max_players}
            </p>
            <Button
              onClick={handleApply}
              className="bg-primary hover:bg-blue-700"
              disabled={isApplying || hasApplied || !tournament.is_open}
            >
              {isApplying ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Applying...
                </>
              ) : hasApplied ? (
                <>
                  <span className="mr-2">✅</span>
                  Applied
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5 mr-2" />
                  Apply to Participate
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TournamentApplication;
