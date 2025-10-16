import { Navigate } from "react-router-dom";

const getUser = () => {
  const userString = localStorage.getItem("user");
  if (!userString) {
    return null;
  }
  try {
    // Parse the user object from localStorage
    return JSON.parse(userString);
  } catch (e) {
    console.error("Invalid user data in localStorage:", e);
    localStorage.removeItem("user"); // Clean up invalid data
    return null;
  }
};

function ProtectedRoute({ children, adminOnly }) {
  const user = getUser();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly && !user.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;
