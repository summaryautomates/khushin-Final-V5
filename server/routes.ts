import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactMessageSchema } from "@shared/schema";
import { z } from "zod";

const shippingSchema = z.object({
  fullName: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  pincode: z.string(),
  phone: z.string(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Products API
  const productsRouter = {
    getAll: async (_req, res) => {
      const products = await storage.getProducts();
      res.json(products);
    },

    getById: async (req, res) => {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    },

    getByCategory: async (req, res) => {
      const products = await storage.getProductsByCategory(req.params.category);
      res.json(products);
    }
  };

  // Checkout API
  app.post("/api/checkout", async (req, res) => {
    try {
      const { items, shipping } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Invalid items array" });
      }

      // Validate shipping information
      const validatedShipping = shippingSchema.parse(shipping);

      // Calculate total
      const subtotal = await calculateSubtotal(items);
      const shippingCost = subtotal >= 5000 ? 0 : 299;
      const total = subtotal + shippingCost;

      // Generate a unique order reference
      const orderRef = `ORD${Date.now()}${Math.random().toString(36).substring(2, 7)}`;

      // Create payment details for QR code
      const paymentDetails = {
        orderRef,
        amount: total,
        upiId: 'merchant@upi', // Replace with actual UPI ID
        merchantName: 'KHUSH.IN'
      };

      // Return order details with QR code payment information
      res.json({
        orderRef,
        total,
        paymentDetails,
        redirectUrl: `/checkout/payment?ref=${orderRef}`
      });
    } catch (error) {
      console.error('Checkout error:', error);
      res.status(500).json({ message: 'Error creating checkout session' });
    }
  });

  // Helper function to calculate subtotal
  async function calculateSubtotal(items: Array<{ productId: number; quantity: number }>) {
    let subtotal = 0;
    for (const item of items) {
      const product = await storage.getProduct(item.productId);
      if (product) {
        subtotal += product.price * item.quantity;
      }
    }
    return subtotal;
  }

  // Register routes
  app.get("/api/products", productsRouter.getAll);
  app.get("/api/products/:id", productsRouter.getById);
  app.get("/api/products/category/:category", productsRouter.getByCategory);

  // Contact route
  app.post("/api/contact", async (req, res) => {
    try {
      const data = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(data);
      res.json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: error.errors 
        });
      }
      throw error;
    }
  });

  return createServer(app);
}