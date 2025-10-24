import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { BookOpen, UserPlus } from "lucide-react";
import Footer from "../components/Footer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import Header from "../components/Header";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-black flex flex-col">
      {/* Header */}
      <Header />
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center relative mb-20">
        {/* Football Image with Animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/hero.jpg"
            alt="Football"
            className="w-full h-full object-cover opacity-40 animate-float-slow"
            style={{ willChange: "transform, opacity" }}
          />
        </div>
        {/* Start Playing Button */}
        <Button
          onClick={() => navigate("/signin")}
          className="max-md:py-6 max-md:px-14 max-md:text-sm relative bg-primary hover:bg-blue-700 text-white font-bold py-8 px-16 rounded-full text-lg shadow-lg hover:shadow-inherit transition-shadow z-10  my-32 hover:scale-105 active:scale-95 "
        >
          Start Playing
        </Button>
      </div>
      {/* Info Cards */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* How to Register Card */}
          <Card className="bg-gray-800 border-none text-gray-200 hover:scale-105  transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserPlus className="h-6 w-6 mr-2 text-white" />
                How to Register
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2">
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

          {/* Game Rules Card */}
          <Card className="bg-gray-800 border-none text-gray-200 hover:scale-105 transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-6 w-6 mr-2 text-white" />
                Game Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  Single-elimination tournament: win to advance, lose to be
                  eliminated.
                </li>
                <li>Matches are assigned randomly by the admin.</li>
                <li>Admins update winners after each match.</li>
                <li>
                  Check your dashboard for real-time rankings and match updates.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>{" "}
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Home;
