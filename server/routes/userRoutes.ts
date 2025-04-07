import type { Express } from "express";

/**
 * User related API routes
 */
export function userRoutes(app: Express) {
  // Get current user details
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      console.log('Unauthorized access attempt to /api/user');
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  });
}