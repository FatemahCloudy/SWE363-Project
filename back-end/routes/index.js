import { Router } from "express";

import authRoutes from "./authRoutes.js";
import memoryRoutes from "./memoryRoutes.js";
import userRoutes from "./userRoutes.js";
import savedMemoryRoutes from "./savedMemoryRoutes.js";
import messageRoutes from "./messageRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import adminRoutes from "./adminRoutes.js";
import collaborativeRoutes from "./collaborativeRoutes.js";

const router = Router();

// Authentication Routes
router.use("/auth", authRoutes);

// Memories
router.use("/memories", memoryRoutes);

// Users
router.use("/users", userRoutes);

// Saved memories
router.use("/saved-memories", savedMemoryRoutes);

// Messages
router.use("/messages", messageRoutes);

// Notifications
router.use("/notifications", notificationRoutes);

// Admin
router.use("/admin", adminRoutes);

// Collaborative groups
router.use("/collaborative", collaborativeRoutes);

export default router;
