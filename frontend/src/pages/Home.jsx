import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { BookOpen, UserPlus, Trophy } from "lucide-react";
import Footer from "../components/Footer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import Header from "../components/Header";
import "./App.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-black flex flex-col">
      <Header />

      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center relative mb-20">
        <div className="absolute inset-0 flex items-center justify-center opacity-50">
          <img
            src="/hero.jpg"
            alt="Football"
            className="w-full h-full object-cover animate-float-slow"
            style={{ willChange: "transform, opacity" }}
            loading="lazy"
          />
        </div>

        <Button
          onClick={() => navigate("/signin")}
          className="relative bg-primary text-white font-bold py-8 px-16 rounded-full text-lg shadow-xl z-10 my-32 active:scale-95 hover:shadow-primary/40 transition-all duration-300 max-md:py-6 max-md:px-14 max-md:text-base"
        >
          Start Playing
        </Button>
      </div>

      {/* Info Cards - 2 on top, 1 centered below */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* How to Register */}
          <Card
            className="bg-gray-800/90 backdrop-blur border-none text-gray-200 hover:-translate-y-3 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 animate-fade-in "
            style={{ willChange: "transform" }}
          >
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <UserPlus className="h-6 w-6 mr-3 text-cyan-400" />
                How to Register
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
              <ol className="list-decimal list-inside space-y-2 text-sm sm:text-base">
                <li>
                  Click "Sign In" to log in or "Register" to create an account.
                </li>
                <li>
                  Complete the registration form with your username, email, and
                  password.
                </li>
                <li>Go to your dashboard and apply for an open tournament.</li>
                <li>
                  Wait for the admin to start the tournament and check your
                  matches!
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Game Rules - FULL ORIGINAL TEXT */}
          <Card
            className="bg-gray-800/90 backdrop-blur border-none text-gray-200 hover:-translate-y-3 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 animate-fade-in"
            style={{ willChange: "transform" }}
          >
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <BookOpen className="h-6 w-6 mr-3 text-green-400" />
                Game Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
              <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
                <li>
                  3-round tournament: All players participate in each round with
                  random pairings.
                </li>
                <li>No elimination - players get 3 chances to play.</li>
                <li>Matches are assigned randomly by the admin each round.</li>
                <li>Admins update winners and scores after each match.</li>
                <li>
                  Check your dashboard for real-time rankings and match updates.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Ranking Card - Centered Below, FULL ORIGINAL TEXT */}
        <div className="flex justify-center">
          <div className="w-full md:w-1/2">
            <Card
              className="bg-gray-800/90 backdrop-blur border-none text-gray-200 hover:-translate-y-3 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 animate-fade-in"
              style={{ willChange: "transform" }}
            >
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Trophy className="h-6 w-6 mr-3 text-yellow-400" />
                  Ranking Calculation
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
                  <li>
                    <strong>Rank:</strong> Determined by rank score (wins × 3 +
                    games played × 0.5), sorted descending.
                  </li>
                  <li>
                    <strong>Games Played:</strong> Total matches participated in
                    the tournament, including byes.
                  </li>
                  <li>
                    <strong>Wins:</strong> Number of matches won, including byes
                    (byes count as wins).
                  </li>
                  <li>
                    <strong>Losses:</strong> Calculated as games played minus
                    wins.
                  </li>
                  <li>
                    <strong>Byes:</strong> Matches where a player has no
                    opponent, counted as a win and game played.
                  </li>
                  <li>
                    <strong>Win Rate:</strong> Percentage of wins out of games
                    played (wins / games played × 100).
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Home;
