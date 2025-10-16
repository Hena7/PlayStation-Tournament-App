import { Navigate } from "react-router-dom";

const getUser = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    return null;
  }
  try {
    // Basic JWT decoding (no signature verification)
    const payload = JSON.parse(atob(token.split(".")[1]));
    return { token, ...payload };
  } catch (e) {
    console.error("Invalid token:", e);
    localStorage.removeItem("token");
    return null;
  }
};

function ProtectedRoute({ children, adminOnly }) {
  const user = getUser();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;
