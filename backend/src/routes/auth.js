import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (username, email, password, is_admin) VALUES ($1, $2, $3, $4) RETURNING id, username, email, is_admin, profile_photo_url",
      [username, email, hashedPassword, false]
    );
    const user = result.rows[0];
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
    const result = await pool.query(
      "SELECT id, username, email, is_admin, profile_photo_url, password FROM users WHERE email = $1",
      [email]
    );
    const user = result.rows[0];
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
