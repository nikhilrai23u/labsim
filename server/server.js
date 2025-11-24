import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/users.js";
import experimentsRoutes from "./routes/experiments.js";
import cors from "cors";

dotenv.config();
const app = express();

connectDB(); // connect to MongoDB

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json()); // parse JSON bodies
app.use("/api/auth", authRoutes); // mount auth routes
app.use("/api/users", userRoutes);
app.use("/api/experiments", experimentsRoutes);



const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
