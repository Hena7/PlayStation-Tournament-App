import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import prisma from "../config/db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Multer Configuration with file size limit
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `user-${req.params.id}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

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
      user.profile_photo_url = `${req.protocol}://${req.get("host")}${
        user.profile_photo_url
      }`;
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
      user.profile_photo_url = `${req.protocol}://${req.get("host")}${
        user.profile_photo_url
      }`;
    }

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// UPLOAD PHOTO
router.post(
  "/:id/photo",
  authMiddleware,
  upload.single("profile_photo"),
  async (req, res) => {
    if (req.user.id !== parseInt(req.params.id)) {
      return res
        .status(403)
        .json({ message: "Forbidden: You can only update your own profile." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const photoUrl = `/uploads/${req.file.filename}`;

    try {
      // Get the current user to check for existing profile photo
      const currentUser = await prisma.user.findUnique({
        where: { id: parseInt(req.params.id) },
        select: { profile_photo_url: true },
      });

      // Delete the previous profile image if it exists
      if (currentUser && currentUser.profile_photo_url) {
        const oldImagePath = path.join("public", currentUser.profile_photo_url);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log(`Deleted old profile image: ${oldImagePath}`);
        }
      }

      const user = await prisma.user.update({
        where: { id: parseInt(req.params.id) },
        data: { profile_photo_url: photoUrl },
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

      user.profile_photo_url = `${req.protocol}://${req.get("host")}${
        user.profile_photo_url
      }`;

      res.json({ message: "Photo uploaded successfully", user });
    } catch (error) {
      console.error("Error updating profile photo:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
