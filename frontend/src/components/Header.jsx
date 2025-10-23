import { Trophy } from "lucide-react";
import React from "react";

const Header = () => {
  return (
    <div>
      <nav className="bg-gray-800 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img
              src="/Logo.png"
              alt="Tournament Manager Logo"
              className="h-16 w-49"
            />
            {/* <Trophy className="h-6 w-6 text-white" />
            <span className="text-white font-bold text-xl"></span> */}
          </div>
          <div className="flex space-x-4">
            <a
              href="/"
              className="text-gray-300 hover:text-white  hover:underline"
            >
              Home
            </a>
            <a
              href="/about"
              className="text-gray-300 hover:text-white hover:underline"
            >
              About
            </a>
            <a
              href="/contact"
              className="text-gray-300 hover:text-white hover:underline"
            >
              Contact
            </a>
            <a
              href="/signin"
              className="text-gray-300 hover:text-white hover:underline"
            >
              Sign In
            </a>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Header;
