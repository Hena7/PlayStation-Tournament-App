import express from "express";
import prisma from "../config/db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// GET USER DATA
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
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

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.profile_photo_url) {
      if (!user.profile_photo_url.startsWith("data:")) {
        user.profile_photo_url = `${req.protocol}://${req.get("host")}${
          user.profile_photo_url
        }`;
      }
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE TEXT DATA
router.put("/:id", authMiddleware, async (req, res) => {
  if (req.user.id !== parseInt(req.params.id)) {
    return res
      .status(403)
      .json({ message: "Forbidden: You can only update your own profile." });
  }

  const {
    username,
    email,
    full_name,
    ethiopian_phone,
    favorite_game,
    controller_id,
  } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: {
        username,
        email,
        full_name,
        ethiopian_phone,
        favorite_game,
        controller_id,
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

    if (user.profile_photo_url) {
      if (!user.profile_photo_url.startsWith("data:")) {
        user.profile_photo_url = `${req.protocol}://${req.get("host")}${
          user.profile_photo_url
        }`;
      }
    }

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// UPLOAD PHOTO (Base64)
router.put("/:id/photo", authMiddleware, async (req, res) => {
  if (req.user.id !== parseInt(req.params.id)) {
    return res
      .status(403)
      .json({ message: "Forbidden: You can only update your own profile." });
  }

  const { photo_base64 } = req.body;

  if (!photo_base64) {
    return res.status(400).json({ message: "No image data" });
  }

  try {
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { profile_photo_url: photo_base64 },
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

    res.json({ message: "Photo uploaded as Base64 successfully!", user });
  } catch (error) {
    console.error("Base64 upload error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
