import { Trophy } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-6 z-10 fixed bottom-0 w-full">
      <div className="flex justify-center items-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Bekisha Tournament. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
export default Footer;
