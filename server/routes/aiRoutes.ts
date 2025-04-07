import type { Express } from "express";
import { z } from "zod";

/**
 * AI chat and assistant API routes
 */
export function aiRoutes(app: Express) {
  // AI chat endpoint
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const messageSchema = z.object({
        message: z.string().min(1, "Message is required")
      });

      const validationResult = messageSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid request data",
          errors: validationResult.error.errors
        });
      }

      try {
        // Import dynamically to avoid circular dependencies
        const { getAIResponse } = await import('../services/ai');
        const response = await getAIResponse(validationResult.data.message);
        
        return res.json({ message: response });
      } catch (apiError) {
        console.error('AI chat error:', apiError);
        throw apiError;
      }
    } catch (error) {
      console.error('Error in AI chat:', error);
      res.status(500).json({
        message: "An unexpected error occurred. Please try again later."
      });
    }
  });
}