import express from "express";
import User from "../models/User.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Current user
router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("_id name email");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
