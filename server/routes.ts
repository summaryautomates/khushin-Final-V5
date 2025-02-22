import type { Express } from "express";
import { storage } from "./storage";
import { insertOrderSchema } from "@shared/schema";
import { z } from "zod";
import { randomBytes } from "crypto";

export async function registerRoutes(app: Express) {
  // Basic routes without authentication
  app.get("/api/products", async (_req, res) => {
    try {
      console.log('Fetching products...');
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
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

  // Payment routes
  app.get("/api/payment/:ref", async (req, res) => {
    try {
      console.log('Fetching payment details for order:', req.params.ref);

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
        upiId: "khush@upi", // Demo UPI ID
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
      console.log('Updating payment status for order:', req.params.ref);

      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const statusSchema = z.object({
        status: z.enum(['completed', 'failed']),
        method: z.enum(['upi', 'cod'])
      });

      const validationResult = statusSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid status data",
          errors: validationResult.error.errors
        });
      }

      const order = await storage.getOrderByRef(req.params.ref);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (order.userId.toString() !== req.user?.id?.toString()) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const { status, method } = validationResult.data;

      // Update order status - pass orderId as string
      await storage.updateOrderStatus(order.orderRef, status, method);

      res.json({ message: "Payment status updated successfully" });
    } catch (error) {
      console.error('Error updating payment status:', error);
      res.status(500).json({ message: "Failed to update payment status" });
    }
  });

  // Protected routes requiring authentication
  app.post("/api/checkout", async (req, res) => {
    try {
      console.log('Processing checkout request...');

      // Check authentication
      if (!req.isAuthenticated()) {
        console.log('User not authenticated');
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = req.user?.id?.toString();
      if (!userId) {
        console.log('User ID not found');
        return res.status(401).json({ message: "Invalid user session" });
      }

      // Validate request body
      const validationResult = insertOrderSchema.safeParse({
        ...req.body,
        userId,
        orderRef: `ORD${randomBytes(4).toString('hex').toUpperCase()}`,
      });

      if (!validationResult.success) {
        console.log('Validation failed:', validationResult.error);
        return res.status(400).json({
          message: "Invalid request data",
          errors: validationResult.error.errors
        });
      }

      const orderData = validationResult.data;

      // Calculate total from validated items
      const total = await Promise.all(
        orderData.items.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          if (!product) {
            throw new Error(`Product not found: ${item.productId}`);
          }
          return product.price * item.quantity;
        })
      ).then(prices => prices.reduce((sum, price) => sum + price, 0));

      // Create order with calculated total
      const order = await storage.createOrder({
        ...orderData,
        total,
        status: 'pending'
      });

      // Clear the user's cart after successful order creation
      await storage.clearCart(userId);

      console.log('Order created successfully:', order.orderRef);

      // Return success response with redirect URL
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

  return app;
}