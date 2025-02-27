import type { Express } from "express";
import { storage } from "./storage";
import { insertOrderSchema } from "@shared/schema";
import { z } from "zod";
import { randomBytes } from "crypto";
import Anthropic from '@anthropic-ai/sdk';

// the newest Anthropic model is "claude-3-5-sonnet-20241022" which was released October 22, 2024
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function registerRoutes(app: Express) {
  app.get("/api/products", async (_req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const product = await storage.getProduct(id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.get("/api/products/category/:category", async (req, res) => {
    try {
      const products = await storage.getProductsByCategory(req.params.category);
      res.json(products);
    } catch (error) {
      console.error('Error fetching products by category:', error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/payment/:ref", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const order = await storage.getOrderByRef(req.params.ref);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (order.userId.toString() !== req.user?.id?.toString()) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const paymentDetails = {
        status: order.status,
        upiId: "khush@upi",
        merchantName: "KHUSH.IN",
        amount: order.total,
        orderRef: order.orderRef
      };

      res.json(paymentDetails);
    } catch (error) {
      console.error('Error fetching payment details:', error);
      res.status(500).json({ message: "Failed to fetch payment details" });
    }
  });

  app.post("/api/payment/:ref/status", async (req, res) => {
    try {
      console.log("Payment status update request received:", {
        ref: req.params.ref,
        body: req.body
      });

      if (!req.isAuthenticated()) {
        console.log("Unauthorized payment status update attempt");
        return res.status(401).json({ message: "Authentication required" });
      }

      const statusSchema = z.object({
        status: z.enum(['completed', 'failed']),
        method: z.enum(['upi', 'cod'])
      });

      const validationResult = statusSchema.safeParse(req.body);
      if (!validationResult.success) {
        console.error("Payment status validation failed:", validationResult.error);
        return res.status(400).json({
          message: "Invalid status data",
          errors: validationResult.error.errors
        });
      }

      const order = await storage.getOrderByRef(req.params.ref);
      if (!order) {
        console.log("Order not found:", req.params.ref);
        return res.status(404).json({ message: "Order not found" });
      }

      if (order.userId.toString() !== req.user?.id?.toString()) {
        console.log("Unauthorized access to order:", {
          orderId: order.userId,
          userId: req.user?.id
        });
        return res.status(403).json({ message: "Unauthorized" });
      }

      const { status, method } = validationResult.data;
      console.log("Updating order status:", {
        ref: order.orderRef,
        status,
        method
      });

      await storage.updateOrderStatus(order.orderRef, status, method);
      console.log("Order status updated successfully");

      res.json({ message: "Payment status updated successfully" });
    } catch (error) {
      console.error('Error updating payment status:', error);
      res.status(500).json({ message: "Failed to update payment status" });
    }
  });

  app.patch("/api/cart/:productId/gift", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = req.user?.id?.toString();
      if (!userId) {
        return res.status(401).json({ message: "Invalid user session" });
      }

      const productId = parseInt(req.params.productId, 10);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const giftSchema = z.object({
        isGift: z.boolean(),
        giftMessage: z.string().optional()
      });

      const validationResult = giftSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid request data",
          errors: validationResult.error.errors
        });
      }

      const { isGift, giftMessage } = validationResult.data;
      await storage.updateCartItemGiftStatus(userId, productId, isGift, giftMessage);

      res.json({ message: "Gift status updated successfully" });
    } catch (error) {
      console.error('Error updating gift status:', error);
      res.status(500).json({ message: "Failed to update gift status" });
    }
  });

  app.post("/api/checkout", async (req, res) => {
    try {
      console.log("Checkout request received:", { body: req.body });

      if (!req.isAuthenticated()) {
        console.log("Unauthorized checkout attempt");
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = req.user?.id?.toString();
      if (!userId) {
        console.log("Invalid user session detected");
        return res.status(401).json({ message: "Invalid user session" });
      }

      const orderData = {
        ...req.body,
        userId,
        orderRef: `ORD${randomBytes(4).toString('hex').toUpperCase()}`
      };

      console.log("Validating order data:", orderData);
      const validationResult = insertOrderSchema.safeParse(orderData);

      if (!validationResult.success) {
        console.error("Order validation failed:", validationResult.error);
        return res.status(400).json({
          message: "Invalid request data",
          errors: validationResult.error.errors
        });
      }

      console.log("Creating order in database");
      const order = await storage.createOrder(validationResult.data);
      console.log("Order created successfully:", order);

      console.log("Clearing user cart");
      await storage.clearCart(userId);

      res.json({
        message: "Order created successfully",
        redirectUrl: `/checkout/payment?ref=${order.orderRef}`
      });
    } catch (error) {
      console.error('Checkout error:', error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to process checkout"
      });
    }
  });

  app.get("/api/orders", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = req.user?.id?.toString();
      if (!userId) {
        return res.status(401).json({ message: "Invalid user session" });
      }

      console.log("Fetching orders for user:", userId);
      const orders = await storage.getOrdersByUserId(userId);
      console.log("Orders fetched successfully:", orders);

      res.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

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

      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(503).json({
          message: "AI service is temporarily unavailable. Please try again later."
        });
      }

      try {
        const response = await anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1024,
          messages: [{
            role: "user",
            content: validationResult.data.message
          }],
          system: "You are an AI shopping assistant for KHUSH.IN, a premium e-commerce platform. Always be helpful, concise, and polite. Focus on providing accurate product information and shopping assistance."
        });

        res.json({ message: response.content[0].text });
      } catch (apiError) {
        console.error('Anthropic API error:', apiError);

        // For development environment, provide a fallback response
        if (process.env.NODE_ENV !== 'production') {
          return res.json({
            message: "Development mode: This is a fallback response. I understand you're asking about: " + 
                    validationResult.data.message + 
                    "\nIn production, this would be answered by the AI assistant."
          });
        }

        return res.status(503).json({
          message: "AI service is temporarily unavailable. Please try again later."
        });
      }
    } catch (error) {
      console.error('Error in AI chat:', error);
      res.status(500).json({ 
        message: "An unexpected error occurred. Please try again later."
      });
    }
  });
}