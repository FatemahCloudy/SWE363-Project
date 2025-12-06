import cors from "cors";
import { createServer } from "http";


export async function registerRoutes(app) {
  const httpServer = createServer(app);

  app.get("/api/health", (req, res) => {
    res.json({
      success: true,
      message: "API is running",
      timestamp: new Date().toISOString(),
      mode: process.env.NODE_ENV || "development"
    });
  });

  app.get("/api/auth/me", (req, res) => {
    res.status(401).json({ error: "Not authenticated - using localStorage mode" });
  });

  app.post("/api/auth/login", (req, res) => {
    res.json({ message: "Using localStorage for authentication in development" });
  });

  app.post("/api/auth/logout", (req, res) => {
    res.json({ message: "Logged out" });
  });

  app.post("/api/auth/signup", (req, res) => {
    res.json({ message: "Using localStorage for signup in development" });
  });

  app.get("/api/memories", (req, res) => {
    res.json([]);
  });

  app.get("/api/memories/:id", (req, res) => {
    res.status(404).json({ error: "Memory not found - using localStorage mode" });
  });

  app.post("/api/memories", (req, res) => {
    res.json({ message: "Using localStorage for memories in development" });
  });

  app.put("/api/memories/:id", (req, res) => {
    res.json({ message: "Using localStorage for memories in development" });
  });

  app.delete("/api/memories/:id", (req, res) => {
    res.status(204).send();
  });

  app.get("/api/memories/:id/reactions", (req, res) => {
    res.json([]);
  });

  app.post("/api/memories/:id/like", (req, res) => {
    res.json({ message: "Using localStorage for likes in development" });
  });

  app.delete("/api/memories/:id/like", (req, res) => {
    res.status(204).send();
  });

  app.get("/api/memories/:id/comments", (req, res) => {
    res.json([]);
  });

  app.post("/api/memories/:id/comments", (req, res) => {
    res.json({ message: "Using localStorage for comments in development" });
  });

  app.get("/api/notifications", (req, res) => {
    res.json([]);
  });

  app.get("/api/notifications/unread-count", (req, res) => {
    res.json({ count: 0 });
  });

  app.put("/api/notifications/:id/read", (req, res) => {
    res.json({ message: "Notification marked as read" });
  });

  app.post("/api/notifications/mark-all-read", (req, res) => {
    res.json({ message: "All notifications marked as read" });
  });

  app.get("/api/messages", (req, res) => {
    res.json([]);
  });

  app.get("/api/messages/conversations", (req, res) => {
    res.json([]);
  });

  app.get("/api/messages/conversation/:userId", (req, res) => {
    res.json([]);
  });

  app.post("/api/messages", (req, res) => {
    res.json({ message: "Using localStorage for messages in development" });
  });

  app.get("/api/users/profile/:username", (req, res) => {
    res.status(404).json({ error: "User not found - using localStorage mode" });
  });

  app.put("/api/users/profile", (req, res) => {
    res.json({ message: "Using localStorage for profile in development" });
  });

  app.get("/api/users/:userId/memories", (req, res) => {
    res.json([]);
  });

  app.get("/api/users/followers", (req, res) => {
    res.json([]);
  });

  app.get("/api/users/following", (req, res) => {
    res.json([]);
  });

  app.post("/api/users/:userId/follow", (req, res) => {
    res.json({ message: "Using localStorage for follows in development" });
  });

  app.delete("/api/users/:userId/follow", (req, res) => {
    res.status(204).send();
  });

  app.get("/api/saved-memories", (req, res) => {
    res.json([]);
  });

  app.post("/api/saved-memories", (req, res) => {
    res.json({ message: "Using localStorage for saved memories in development" });
  });

  app.delete("/api/saved-memories/:memoryId", (req, res) => {
    res.status(204).send();
  });

  app.get("/api/reports", (req, res) => {
    res.json([]);
  });

  app.post("/api/reports", (req, res) => {
    res.json({ message: "Using localStorage for reports in development" });
  });

  app.get("/api/admin/stats", (req, res) => {
    res.json({
      totalUsers: 0,
      totalMemories: 0,
      totalLikes: 0,
      totalComments: 0,
      pendingReports: 0
    });
  });

  app.get("/api/admin/users", (req, res) => {
    res.json([]);
  });

  app.post("/api/admin/users", (req, res) => {
    res.json({ message: "Using localStorage for admin users in development" });
  });

  app.put("/api/admin/users/:id", (req, res) => {
    res.json({ message: "Using localStorage for admin users in development" });
  });

  app.delete("/api/admin/users/:id", (req, res) => {
    res.status(204).send();
  });

  app.get("/api/admin/reports", (req, res) => {
    res.json([]);
  });

  app.post("/api/admin/reports/:id/review", (req, res) => {
    res.json({ message: "Report reviewed" });
  });

  app.get("/api/admin/content", (req, res) => {
    res.json([]);
  });

  app.post("/api/admin/content", (req, res) => {
    res.json({ message: "Using localStorage for content in development" });
  });

  app.put("/api/admin/content/:id", (req, res) => {
    res.json({ message: "Content updated" });
  });

  app.delete("/api/admin/content/:id", (req, res) => {
    res.status(204).send();
  });

  app.get("/api/admin/notifications", (req, res) => {
    res.json([]);
  });

  app.post("/api/admin/notifications", (req, res) => {
    res.json({ message: "Notification created" });
  });

  app.delete("/api/admin/notifications/:id", (req, res) => {
    res.status(204).send();
  });

  app.get("/api/admin/innovations", (req, res) => {
    res.json([]);
  });

  app.post("/api/admin/innovations", (req, res) => {
    res.json({ message: "Innovation idea submitted" });
  });

  app.put("/api/admin/innovations/:id", (req, res) => {
    res.json({ message: "Innovation updated" });
  });

  app.delete("/api/admin/innovations/:id", (req, res) => {
    res.status(204).send();
  });

  app.get("/api/admin/locations", (req, res) => {
    res.json([]);
  });

  app.post("/api/admin/locations", (req, res) => {
    res.json({ message: "Location created" });
  });

  app.put("/api/admin/locations/:id", (req, res) => {
    res.json({ message: "Location updated" });
  });

  app.delete("/api/admin/locations/:id", (req, res) => {
    res.status(204).send();
  });

  app.get("/api/search-settings", (req, res) => {
    res.json({});
  });

  app.put("/api/search-settings", (req, res) => {
    res.json({ message: "Search settings updated" });
  });

  app.put("/api/admin/security/password", (req, res) => {
    res.json({ success: true });
  });

  app.put("/api/admin/security/email", (req, res) => {
    res.json({ success: true });
  });

  app.get("/api/collaborative/groups", (req, res) => {
    res.json([]);
  });

  app.get("/api/collaborative/groups/:id", (req, res) => {
    res.status(404).json({ error: "Group not found" });
  });

  app.post("/api/collaborative/create", (req, res) => {
    res.json({ success: true, data: { group: {} } });
  });

  app.post("/api/collaborative/groups/:id/invite", (req, res) => {
    res.json({ message: "Invitation sent" });
  });

  app.post("/api/collaborative/groups/:id/join", (req, res) => {
    res.json({ message: "Joined group" });
  });

  app.post("/api/collaborative/groups/:id/leave", (req, res) => {
    res.json({ message: "Left group" });
  });

  app.post("/api/collaborative/groups/:id/memories", (req, res) => {
    res.json({ message: "Memory added to group" });
  });

  app.delete("/api/collaborative/groups/:id", (req, res) => {
    res.status(204).send();
  });

  app.delete("/api/collaborative/groups/:id/memories/:memoryId", (req, res) => {
    res.status(204).send();
  });

  return httpServer;
}
