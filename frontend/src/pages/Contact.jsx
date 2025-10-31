import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Mail, Send, Phone } from "lucide-react"; // Removed Telegram
import Footer from "../components/Footer";
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
    alert("Form submitted! We will get back to you soon.");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black flex flex-col mb-16">
      <Header />

      <div className="flex-1 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
          <img
            src="/contact.jpg"
            alt="Gaming Setup"
            className="w-full h-full object-cover animate-pulse"
            style={{ animation: "pulse 6s infinite" }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center justify-center py-12 px-4 sm:py-16">
          <div className="max-w-5xl w-full">
            <div className="text-center mb-10">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 flex items-center justify-center gap-3">
                <Mail className="h-10 w-10 text-cyan-400 animate-pulse" />
                Get in Touch
              </h1>
              <p className="text-gray-300 text-lg">
                We'd love to hear from you!
              </p>
            </div>

            <Card className="bg-gray-800/90 backdrop-blur-xl border-none shadow-2xl hover:shadow-primary/20 transition-all duration-500 opacity-80">
              <CardContent className="p-6 sm:p-8 lg:p-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                  {/* Contact Info */}
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white mb-6">
                      Contact Information
                    </h2>

                    <div className="space-y-5">
                      <div className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-xl hover:bg-gray-700/70 transition-all group">
                        <div className="p-3 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-all">
                          <Mail className="h-6 w-6 text-cyan-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Email</p>
                          <p className="text-white font-medium">
                            support@bekishatournament.com
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-xl hover:bg-gray-700/70 transition-all group">
                        <div className="p-3 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-all">
                          <Phone className="h-6 w-6 text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Phone</p>
                          <p className="text-white font-medium">
                            +251-123-456-789
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-xl hover:bg-gray-700/70 transition-all group">
                        <div className="p-3 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-all">
                          <Send className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Telegram</p>
                          <p className="text-white font-medium">
                            @BekishaTournament
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Form */}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <h2 className="text-2xl font-bold text-white mb-6">
                      Send us a Message
                    </h2>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700/70 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="Your name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700/70 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="your@email.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Message
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700/70 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                        rows="5"
                        placeholder="Tell us what's on your mind..."
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-primary hover:shadow-xl hover:shadow-primary/30 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-lg"
                    >
                      <Send className="h-5 w-5" />
                      Send Message
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Contact;
