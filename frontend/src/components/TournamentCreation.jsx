import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useState } from "react";
import api from "../lib/api";

function TournamentCreation({ onCreate, disabled }) {
  const [name, setName] = useState(
    `Tournament ${new Date().toISOString().split("T")[0]}`
  );
  const [maxPlayers, setMaxPlayers] = useState(10);

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/api/tournament/create",
        { name, max_players: Number(maxPlayers) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onCreate(response.data);
    } catch (error) {
      console.error("Error creating tournament:", error);
    }
  };

  return (
    <Card className="bg-gray-800 border-none mb-8">
      <CardHeader>
        <CardTitle>Create Tournament</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Tournament name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full max-w-xs"
            disabled={disabled}
          />
          <Input
            type="number"
            placeholder="Max number of participants (e.g., 10 or 50)"
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(Number(e.target.value))}
            className="w-full max-w-xs"
            min={2}
            max={50}
            disabled={disabled}
          />
          <Button
            onClick={handleCreate}
            className="bg-primary hover:bg-blue-700"
            disabled={disabled}
          >
            Create Tournament
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default TournamentCreation;
