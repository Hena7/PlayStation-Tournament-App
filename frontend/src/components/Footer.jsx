import { Trophy } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-6">
      <div className="flex justify-center items-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} PS5 Tournament. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
