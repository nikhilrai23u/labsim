import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret_change_me";
const generateToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" });

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("[AUTH] signup", { email });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: passwordHash });
    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("[AUTH] signup error", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("[AUTH] login", { email });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("[AUTH] login error", err.message);
    res.status(500).json({ message: err.message });
  }
};
