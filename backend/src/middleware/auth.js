import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const adminMiddleware = (req, res, next) => {
  if (!req.user.is_admin)
    return res.status(403).json({ message: "Admin access required" });
  next();
};
