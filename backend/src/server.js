import express from "express";
import cors from "cors";
import 'dotenv/config'
import authRoutes from "./routes/auth.js";
import tournamentRoutes from "./routes/tournament.js";
import rankingRoutes from "./routes/ranking.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tournament", tournamentRoutes);
app.use("/api/ranking", rankingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
