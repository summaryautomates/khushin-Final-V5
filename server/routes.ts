import type { Express } from "express";
import { storage } from "./storage";
import { insertOrderSchema } from "@shared/schema";
import { z } from "zod";
import { randomBytes } from "crypto";

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
      await storage.updateOrderStatus(order.orderRef, status, method);

      res.json({ message: "Payment status updated successfully" });
    } catch (error) {
      console.error('Error updating payment status:', error);
      res.status(500).json({ message: "Failed to update payment status" });
    }
  });

  app.post("/api/checkout", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = req.user?.id?.toString();
      if (!userId) {
        return res.status(401).json({ message: "Invalid user session" });
      }

      const orderData = {
        ...req.body,
        userId,
        orderRef: `ORD${randomBytes(4).toString('hex').toUpperCase()}`
      };

      const validationResult = insertOrderSchema.safeParse(orderData);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid request data",
          errors: validationResult.error.errors
        });
      }

      const order = await storage.createOrder(validationResult.data);
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

  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  return app.listen(port, '0.0.0.0', () => {
    console.log(`Server started on port ${port}`);
  });
}