import { Trophy } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center px-4">
        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <Trophy className="h-5 w-5 text-white" />
          <span className="text-white font-semibold">PS5 Tournament</span>
        </div>
        <div className="flex space-x-4">
          <a href="/about" className="hover:text-white">
            About
          </a>
          <a href="/contact" className="hover:text-white">
            Contact
          </a>
        </div>
        <div className="mt-4 md:mt-0">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} PS5 Tournament. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
