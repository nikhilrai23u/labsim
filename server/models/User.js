import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

// ✅ Prevent OverwriteModelError
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
