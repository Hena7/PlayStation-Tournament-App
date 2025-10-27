import { Button } from ".././components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from ".././components/ui/card";
import { Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from ".././components/Footer";
import "./App.css";
import Header from "../components/Header";

function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-black flex flex-col">
      {/* Navbar */}
      <Header />
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center relative py-16">
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/about.jpg"
            alt="Game Controller"
            className="w-full h-full object-cover "
            style={{ willChange: "transform, opacity" }}
          />
        </div>
        <div className="max-w-4xl mx-auto px-4 z-10">
          <Card className="bg-gray-800 border-none text-gray-200 hover:shadow-lg transition-shadow animate-fade-in opacity-80">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Trophy className="h-6 w-6 mr-2 text-white" />
                About Bekisha Tournament
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Welcome to the ultimate PlayStation tournament platform! Compete
                in thrilling single-elimination tournaments, showcase your
                gaming skills, and climb the ranks to become a champion.
              </p>
              <p>
                Our platform offers seamless registration, real-time match
                updates, and a user-friendly dashboard to track your progress.
                Admins manage tournaments with ease, ensuring fair and exciting
                gameplay for all.
              </p>
              <Button
                onClick={() => navigate("/signin")}
                className="bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                Join Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default About;
