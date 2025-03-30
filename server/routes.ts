import type { Express } from "express";
import { storage } from "./storage";
import { insertOrderSchema } from "@shared/schema";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { randomBytes } from "crypto";

export async function registerRoutes(app: Express) {
  // Product endpoints
  app.get("/api/products", async (_req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      res.status(500).json({ 
        message: "Failed to fetch products", 
        error: process.env.NODE_ENV === 'production' ? undefined : (error instanceof Error ? error.message : 'Unknown error')
      });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProductById(parseInt(req.params.id));
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

  // Authentication endpoints are defined in auth.ts

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // User endpoints
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      console.log('Unauthorized access attempt to /api/user');
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  });

  // Checkout endpoint
  app.post("/api/checkout", async (req, res) => {
    try {
      console.log("Checkout request received");

      if (!req.isAuthenticated()) {
        console.log("Unauthorized checkout attempt");
        return res.status(401).json({ message: "Authentication required" });
      }

      // Validate the order data
      const validationResult = insertOrderSchema.safeParse(req.body);

      if (!validationResult.success) {
        console.error("Order validation failed:", validationResult.error);
        return res.status(400).json({
          message: "Invalid order data",
          errors: validationResult.error.errors
        });
      }

      // Generate a unique order reference
      const orderRef = randomBytes(8).toString('hex');

      // Create the order in the database
      const orderData = {
        ...validationResult.data,
        orderRef,
        status: 'pending' as const
      };

      console.log("Creating order:", {
        ref: orderRef,
        userId: req.user?.id,
        itemCount: orderData.items.length,
        total: orderData.total
      });

      const order = await storage.createOrder(orderData);
      console.log("Order created successfully:", { ref: order.orderRef });

      // Redirect to payment page
      res.json({
        message: "Order created successfully",
        redirectUrl: `/checkout/payment?ref=${orderRef}`,
        orderRef
      });
    } catch (error) {
      console.error('Error processing checkout:', error);
      res.status(500).json({
        message: "Failed to process checkout. Please try again."
      });
    }
  });

  // Payment status update endpoint
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

  // Payment details endpoint
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

  // Orders history endpoint
  app.get("/api/orders", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const orders = await storage.getOrdersByUserId(req.user.id.toString());
      res.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

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
        const query = validationResult.data.message.toLowerCase();
        let response;

        if (query.includes('product') || query.includes('lighter')) {
          response = mockResponses.product(query);
        } else if (query.includes('price') || query.includes('cost')) {
          response = mockResponses.pricing(query);
        } else if (query.includes('shipping') || query.includes('delivery')) {
          response = mockResponses.shipping();
        } else {
          response = mockResponses.default(query);
        }

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

const mockResponses = {
  product: (query: string) => `Here are some details about our products that match your query "${query}". We have a wide range of premium lighters and accessories.`,
  pricing: (query: string) => `Our products are premium quality and prices vary. For specific pricing on "${query}", I recommend checking our product catalog.`,
  shipping: () => "We offer worldwide shipping. Standard delivery takes 3-5 business days within India, and international shipping typically takes 7-14 business days.",
  default: (query: string) => `I understand you're asking about: ${query}. As your shopping assistant, I'm here to help with product information, shipping details, and any other questions about KHUSH.IN's premium products.`
};