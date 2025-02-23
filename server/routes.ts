import type { Express } from "express";
import { storage } from "./storage";
import { insertOrderSchema, insertCategorySchema } from "@shared/schema";
import { z } from "zod";
import { randomBytes } from "crypto";

export async function registerRoutes(app: Express) {
  // Category Routes
  app.get("/api/categories", async (_req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/featured", async (_req, res) => {
    try {
      const categories = await storage.getFeaturedCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching featured categories:', error);
      res.status(500).json({ message: "Failed to fetch featured categories" });
    }
  });

  app.get("/api/categories/:slug", async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error('Error fetching category:', error);
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  app.get("/api/categories/:id/products", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      const products = await storage.getCategoryProducts(categoryId);
      res.json(products);
    } catch (error) {
      console.error('Error fetching category products:', error);
      res.status(500).json({ message: "Failed to fetch category products" });
    }
  });

  app.get("/api/categories/:id/subcategories", async (req, res) => {
    try {
      const parentId = parseInt(req.params.id);
      if (isNaN(parentId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      const subcategories = await storage.getSubcategories(parentId);
      res.json(subcategories);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      res.status(500).json({ message: "Failed to fetch subcategories" });
    }
  });

  app.get("/api/categories/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const categories = await storage.searchCategoriesByName(query);
      res.json(categories);
    } catch (error) {
      console.error('Error searching categories:', error);
      res.status(500).json({ message: "Failed to search categories" });
    }
  });

  // Existing Product Routes
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
}