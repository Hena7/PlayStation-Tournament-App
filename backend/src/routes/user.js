import express from "express";
import multer from "multer";
import path from "path";
import db from "../config/db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Multer Configuration
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

const upload = multer({ storage });

// GET USER DATA
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, username, email, is_admin, profile_photo_url
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];
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

  const { username, email } = req.body;

  try {
    const result = await db.query(
      `UPDATE users 
       SET username = $1, email = $2 
       WHERE id = $3 
       RETURNING id, username, email, is_admin, profile_photo_url`,
      [username, email, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];
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
      const result = await db.query(
        `UPDATE users 
       SET profile_photo_url = $1 
       WHERE id = $2 
       RETURNING id, username, email, is_admin, profile_photo_url`,
        [photoUrl, req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const user = result.rows[0];
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
