import { Trophy, Menu, X } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/rounds", label: "Rounds" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className="bg-gray-800/95 backdrop-blur-sm sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center group">
            <img
              src="/Logo.png"
              alt="Tournament Manager"
              className="h-12 md:h-16 transition-transform group-hover:scale-105"
            />
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="relative px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200
                           after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r
                           after:from-blue-400 after:to-cyan-400 after:transition-all after:duration-300
                           hover:after:w-full"
              >
                {label}
              </a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden
                    ${
                      mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
      >
        <div className="px-4 pt-2 pb-4 space-y-1 bg-gray-800/95 backdrop-blur-sm border-t border-gray-700">
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg
                         transition-all duration-200 hover:translate-x-1"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Header;
