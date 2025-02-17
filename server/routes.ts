import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactMessageSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

const shippingSchema = z.object({
  fullName: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  pincode: z.string(),
  phone: z.string(),
});

const paymentStatusSchema = z.object({
  status: z.enum(['pending', 'completed', 'failed'])
});

const paymentStore = new Map<string, {
  status: 'pending' | 'completed' | 'failed',
  details: {
    upiId: string,
    merchantName: string,
    amount: number,
    orderRef: string
  }
}>();

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
  const productsRouter = {
    getAll: async (_req: any, res: any) => {
      try {
        const products = await storage.getProducts();
        res.json(products);
      } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
          message: "Failed to fetch products",
          details: "An error occurred while retrieving the products"
        });
      }
    },

    getById: async (req: any, res: any) => {
      try {
        const id = Number(req.params.id);
        if (isNaN(id) || id < 1) {
          return res.status(400).json({
            message: "Invalid product ID",
            details: "Product ID must be a positive number"
          });
        }
        const product = await storage.getProduct(id);
        if (!product) {
          return res.status(404).json({
            message: "Product not found",
            details: "The requested product does not exist"
          });
        }
        res.json(product);
      } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
          message: "Failed to fetch product",
          details: "An error occurred while retrieving the product"
        });
      }
    },

    getByCategory: async (req: any, res: any) => {
      try {
        const products = await storage.getProductsByCategory(req.params.category);
        res.json(products);
      } catch (error) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({
          message: "Failed to fetch products",
          details: "An error occurred while retrieving the products for this category"
        });
      }
    }
  };

  app.post("/api/checkout", async (req, res) => {
    try {
      const { items, shipping } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Invalid items array" });
      }

      const validatedShipping = shippingSchema.parse(shipping);

      const subtotal = await calculateSubtotal(items);
      const shippingCost = subtotal >= 5000 ? 0 : 299;
      const total = subtotal + shippingCost;

      const orderRef = `ORD${Date.now()}${Math.random().toString(36).substring(2, 7)}`;

      const paymentDetails = {
        orderRef,
        upiId: process.env.MERCHANT_UPI_ID || 'merchant@upi',
        merchantName: 'KHUSH.IN',
        amount: total
      };

      paymentStore.set(orderRef, {
        status: 'pending',
        details: paymentDetails
      });

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

  app.post("/api/direct-checkout", async (req, res) => {
    try {
      const { items } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Invalid items array" });
      }

      const subtotal = await calculateSubtotal(items);
      const shippingCost = subtotal >= 5000 ? 0 : 299;
      const total = subtotal + shippingCost;

      const orderRef = `ORD${Date.now()}${Math.random().toString(36).substring(2, 7)}`;

      const paymentDetails = {
        orderRef,
        upiId: process.env.MERCHANT_UPI_ID || 'merchant@upi',
        merchantName: 'KHUSH.IN',
        amount: total
      };

      paymentStore.set(orderRef, {
        status: 'pending',
        details: paymentDetails
      });

      const orderItems = await Promise.all(items.map(async (item) => {
        const product = await storage.getProduct(item.productId);
        return {
          productId: item.productId,
          quantity: item.quantity,
          price: product?.price || 0,
          name: product?.name || 'Unknown Product'
        };
      }));

      // For direct checkout, we'll create a minimal shipping entry
      const defaultShipping = {
        fullName: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: ''
      };

      orderStore.set(orderRef, {
        orderRef,
        status: 'pending',
        total,
        items: orderItems,
        shipping: defaultShipping,
        createdAt: new Date().toISOString()
      });

      res.json({
        orderRef,
        total,
        redirectUrl: `/checkout/payment?ref=${orderRef}`
      });
    } catch (error) {
      console.error('Direct checkout error:', error);
      res.status(500).json({ message: 'Error creating checkout session' });
    }
  });

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

  app.post("/api/payment/:orderRef/status", (req, res) => {
    try {
      const { orderRef } = req.params;
      const validatedBody = paymentStatusSchema.parse(req.body);

      const payment = paymentStore.get(orderRef);
      const order = orderStore.get(orderRef);

      if (!payment || !order) {
        return res.status(404).json({
          message: "Order not found",
          details: "The specified order reference could not be found"
        });
      }

      payment.status = validatedBody.status;
      order.status = validatedBody.status;

      paymentStore.set(orderRef, payment);
      orderStore.set(orderRef, order);

      res.json({
        status: validatedBody.status,
        orderRef,
        updated: new Date().toISOString()
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid input",
          details: fromZodError(error).message
        });
      }
      console.error('Payment status update error:', error);
      res.status(500).json({
        message: "Internal server error",
        details: "Failed to update payment status"
      });
    }
  });

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

  app.get("/api/products", productsRouter.getAll);
  app.get("/api/products/:id", productsRouter.getById);
  app.get("/api/products/category/:category", productsRouter.getByCategory);

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

  app.get("/api/orders", (_req, res) => {
    const orders = Array.from(orderStore.values());
    res.json(orders.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  });

  return createServer(app);
}