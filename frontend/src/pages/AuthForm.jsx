import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import api from "../lib/api";
import { Trophy, Loader2 } from "lucide-react";
import Footer from "../components/Footer";
import Header from "../components/Header";

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
    ethiopian_phone: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!isLogin) {
      if (!formData.username.trim())
        newErrors.username = "Username is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      if (!formData.password.trim())
        newErrors.password = "Password is required";
      if (!formData.ethiopian_phone.trim())
        newErrors.ethiopian_phone = "Phone number is required";
    } else {
      if (!formData.email.trim()) newErrors.email = "Email is required";
      if (!formData.password.trim())
        newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const url = isLogin ? `/api/auth/login` : `/api/auth/register`;
      const response = await api.post(url, formData);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate(response.data.user.is_admin ? "/admin" : "/dashboard");
    } catch (error) {
      console.error("Auth error:", error);
      if (isLogin && error.response?.status === 401) {
        setErrors({ general: "Email or password is incorrect" });
      } else {
        setErrors({ general: "An error occurred. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className=" bg-gradient-to-br from-blue-900 to-black flex items-center justify-center p-4 mb-20">
        <div className="w-full max-w-md">
          {/* Trophy Header */}
          <div className="text-center mb-8">
            <Trophy className="h-12 w-12 text-yellow-400 mx-auto animate-pulse" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white mt-3">
              {isLogin ? "Welcome Back" : "Join the Arena"}
            </h1>
            <p className="text-gray-300 mt-2">
              {isLogin
                ? "Log in to continue your journey"
                : "Create your gaming profile"}
            </p>
          </div>

          {/* Auth Card */}
          <div className="bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-700 hover:border-primary/50 transition-all duration-300">
            {errors.general && (
              <div className="mb-5 p-3 bg-red-900/50 border border-red-700/50 rounded-lg text-red-300 text-sm text-center">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      placeholder="Abebe Bekele"
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                      className="w-full bg-gray-700/70 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Username
                    </label>
                    <Input
                      type="text"
                      placeholder="TigerWarrior"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      className="w-full bg-gray-700/70 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                    {errors.username && (
                      <p className="mt-1 text-xs text-red-400">
                        {errors.username}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      placeholder="+251 912 345 678"
                      value={formData.ethiopian_phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ethiopian_phone: e.target.value,
                        })
                      }
                      className="w-full bg-gray-700/70 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                    {errors.ethiopian_phone && (
                      <p className="mt-1 text-xs text-red-400">
                        {errors.ethiopian_phone}
                      </p>
                    )}
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full bg-gray-700/70 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-400">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full bg-gray-700/70 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-400">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:shadow-xl hover:shadow-primary/30 text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : isLogin ? (
                  "Login"
                ) : (
                  "Register"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                variant="link"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                }}
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                {isLogin
                  ? "Need an account? Register"
                  : "Have an account? Login"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default AuthForm;
