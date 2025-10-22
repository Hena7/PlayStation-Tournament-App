import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Trophy } from "lucide-react";
import Footer from "../components/Footer";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-black flex flex-col">
      {/* Navbar */}
      <nav className="bg-gray-800 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Trophy className="h-6 w-6 text-white" />
            <span className="text-white font-bold text-xl">PS5 Tournament</span>
          </div>
          <div className="flex space-x-4">
            <a href="/" className="text-gray-300 hover:text-white">
              Home
            </a>
            <a href="/about" className="text-gray-300 hover:text-white">
              About
            </a>
            <a href="/contact" className="text-gray-300 hover:text-white">
              Contact
            </a>
            <a href="/signin" className="text-gray-300 hover:text-white">
              Sign In
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* Football Image with Animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="https://i.pinimg.com/736x/86/1e/c6/861ec64c5ff4beae124b4d5974dac741.jpg"
            alt="Football"
            className="w-full h-full object-cover opacity-40 animate-float-slow"
            style={{ willChange: "transform, opacity" }}
          />
        </div>
        {/* Start Playing Button */}
        <Button
          onClick={() => navigate("/signin")}
          className="relative bg-primary hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg shadow-lg hover:shadow-xl transition-shadow z-10"
        >
          Start Playing
        </Button>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Home;
