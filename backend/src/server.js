import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

import authRoutes from "./routes/auth.js";
import rankingRoutes from "./routes/ranking.js";
// import auserRoutes from "./routes/auser.js";
import userRoutes from "./routes/user.js"; // Import the new user routes

const app = express();

// Replicate __dirname functionality in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Middleware ---
app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory
// This makes files in 'public/uploads' accessible via URLs like 'http://localhost:5000/uploads/filename.jpg'
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// --- API Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes); // Use the new user routes
app.use("/api/ranking", rankingRoutes);
// app.use("/api/auser", auserRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
