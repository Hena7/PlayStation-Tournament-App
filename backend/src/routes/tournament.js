import express from "express";
import tournamentUsers from "./tournamentUsers.js";
import tournamentLifecycle from "./tournamentLifecycle.js";
import tournamentMatches from "./tournamentMatches.js";

const router = express.Router();

// Use sub-routers
router.use("/", tournamentUsers);
router.use("/", tournamentLifecycle);
router.use("/", tournamentMatches);

export default router;
