import { useState } from "react";
import { Button } from ".././components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from ".././components/ui/card";
import { Mail } from "lucide-react";
import Footer from ".././components/Footer";
import "./App.css";
import Header from "../components/Header";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder for form submission logic
    alert("Form submitted! We will get back to you soon.");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-black flex flex-col">
      {/* Navbar */}
      <Header />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center relative py-16">
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/contact.jpg"
            alt="Game Controller"
            className="w-full h-full object-cover"
            style={{ willChange: "transform, opacity" }}
          />
        </div>
        <div className="max-w-4xl mx-auto px-4 z-10">
          <Card className="bg-gray-800 border-none text-gray-200 hover:shadow-lg transition-shadow animate-fade-in opacity-80">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Mail className="h-6 w-6 mr-2 text-white" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 animate-slide-up">
                  <p>Email: support@bekishatournament.com</p>
                  <p>Phone: +251-123-456-789</p>
                  <p>Follow us on Telegram: @BekishaTournament</p>
                </div>
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 animate-slide-up"
                >
                  <div>
                    <label className="block text-sm font-medium">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-700 rounded text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-700 rounded text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-700 rounded text-white"
                      rows="4"
                      required
                    ></textarea>
                  </div>
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                  >
                    Send Message
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Contact;
