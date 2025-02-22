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