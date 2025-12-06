import express from "express";
import User from "../models/User.js";  
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/:id", protect, async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

export default router;
