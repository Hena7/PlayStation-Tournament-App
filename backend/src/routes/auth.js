import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const {
    username,
    email,
    password,
    full_name,
    ethiopian_phone,
    favorite_game,
    controller_id,
  } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        is_admin: false,
        full_name,
        ethiopian_phone,
        favorite_game,
        controller_id,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
      },
      select: {
        id: true,
        username: true,
        email: true,
        is_admin: true,
        profile_photo_url: true,
        full_name: true,
        ethiopian_phone: true,
        favorite_game: true,
        controller_id: true,
        gamesPlayed: true,
        wins: true,
        losses: true,
      },
    });
    const token = jwt.sign(
      { id: user.id, is_admin: user.is_admin },
      process.env.JWT_SECRET
    );
    // Ensure full URL for profile_photo_url
    if (user.profile_photo_url) {
      user.profile_photo_url = `${req.protocol}://${req.get("host")}${
        user.profile_photo_url
      }`;
    }
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        is_admin: true,
        profile_photo_url: true,
        password: true,
        full_name: true,
        ethiopian_phone: true,
        favorite_game: true,
        controller_id: true,
        gamesPlayed: true,
        wins: true,
        losses: true,
      },
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user.id, is_admin: user.is_admin },
      process.env.JWT_SECRET
    );
    // Remove password from response
    delete user.password;
    // Ensure full URL for profile_photo_url
    if (user.profile_photo_url) {
      user.profile_photo_url = `${req.protocol}://${req.get("host")}${
        user.profile_photo_url
      }`;
    }
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
