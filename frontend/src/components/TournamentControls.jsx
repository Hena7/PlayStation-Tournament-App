import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Lock, Trash2 } from "lucide-react";
import axios from "../lib/api";
import { useState } from "react";

function TournamentControls({ tournament, onClose, onReset }) {
  const [isClosing, setIsClosing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleClose = async () => {
    if (
      !window.confirm(
        "Are you sure you want to close the tournament? No more applications will be accepted."
      )
    ) {
      return;
    }
    setIsClosing(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/tournament/close",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onClose();
    } catch (error) {
      console.error("Error closing tournament:", error);
    } finally {
      setIsClosing(false);
    }
  };

  const handleReset = async () => {
    if (
      !window.confirm(
        "Are you sure you want to reset the tournament? This will delete all matches, rankings, and participants."
      )
    ) {
      return;
    }
    setIsResetting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete("/api/tournament/reset", {
        headers: { Authorization: `Bearer ${token}` },
      });
      onReset();
    } catch (error) {
      console.error("Error resetting tournament:", error);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Card className="bg-gray-800 border-none mb-8">
      <CardHeader>
        <CardTitle>Tournament Controls</CardTitle>
      </CardHeader>
      <CardContent>
        {tournament && (
          <div className="flex space-x-4">
            <Button
              onClick={handleClose}
              className="bg-yellow-600 hover:bg-yellow-700"
              disabled={isClosing || !tournament.is_open}
            >
              {isClosing ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Closing...
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5 mr-2" />
                  Close Tournament
                </>
              )}
            </Button>
            <Button
              onClick={handleReset}
              className="bg-red-600 hover:bg-red-900"
              disabled={isResetting}
            >
              {isResetting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Resetting...
                </>
              ) : (
                <>
                  <Trash2 className="h-5 w-5 mr-2" />
                  Reset Tournament
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TournamentControls;
