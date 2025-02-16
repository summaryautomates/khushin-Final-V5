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

// Payment status tracking (in-memory for demo)
const paymentStore = new Map<string, {
  status: 'pending' | 'completed' | 'failed',
  details: {
    upiId: string,
    merchantName: string,
    amount: number,
    orderRef: string
  }
}>();

// Order storage (in-memory for demo)
const orderStore = new Map<string, {
  orderRef: string,
  status: 'pending' | 'completed' | 'failed',
  total: number,
  items: Array<{
    productId: number,
    quantity: number,
    price: number,
    name: string
  }>,
  shipping: {
    fullName: string,
    address: string,
    city: string,
    state: string,
    pincode: string,
    phone: string
  },
  createdAt: string
}>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Products API
  const productsRouter = {
    getAll: async (_req: any, res: any) => {
      const products = await storage.getProducts();
      res.json(products);
    },

    getById: async (req: any, res: any) => {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    },

    getByCategory: async (req: any, res: any) => {
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

      // Create payment details
      const paymentDetails = {
        orderRef,
        upiId: process.env.MERCHANT_UPI_ID || 'merchant@upi',
        merchantName: 'KHUSH.IN',
        amount: total
      };

      // Store payment status
      paymentStore.set(orderRef, {
        status: 'pending',
        details: paymentDetails
      });

      // Store order details
      const orderItems = await Promise.all(items.map(async (item) => {
        const product = await storage.getProduct(item.productId);
        return {
          productId: item.productId,
          quantity: item.quantity,
          price: product?.price || 0,
          name: product?.name || 'Unknown Product'
        };
      }));

      orderStore.set(orderRef, {
        orderRef,
        status: 'pending',
        total,
        items: orderItems,
        shipping: validatedShipping,
        createdAt: new Date().toISOString()
      });

      // Return order details with payment information
      res.json({
        orderRef,
        total,
        redirectUrl: `/checkout/payment?ref=${orderRef}`
      });
    } catch (error) {
      console.error('Checkout error:', error);
      res.status(500).json({ message: 'Error creating checkout session' });
    }
  });

  // Payment status API
  app.get("/api/payment/:orderRef", (req, res) => {
    const { orderRef } = req.params;
    const payment = paymentStore.get(orderRef);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json({
      status: payment.status,
      ...payment.details
    });
  });

  // Update payment status (for demo purposes)
  app.post("/api/payment/:orderRef/status", (req, res) => {
    const { orderRef } = req.params;
    const { status } = req.body;

    const payment = paymentStore.get(orderRef);
    const order = orderStore.get(orderRef);

    if (!payment || !order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!['pending', 'completed', 'failed'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Update both payment and order status
    payment.status = status;
    order.status = status;

    paymentStore.set(orderRef, payment);
    orderStore.set(orderRef, order);

    res.json({ status });
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

  // Orders API endpoint
  app.get("/api/orders", (_req, res) => {
    const orders = Array.from(orderStore.values());
    res.json(orders.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  });

  return createServer(app);
}