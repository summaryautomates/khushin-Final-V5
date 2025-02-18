import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactMessageSchema, insertReturnRequestSchema, insertCartItemSchema } from "@shared/schema";
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

const discountStore = new Map<string, {
  code: string,
  discountPercent: number,
  validUntil: string,
  isActive: boolean
}>();

// Add some sample discount codes
discountStore.set('WELCOME10', {
  code: 'WELCOME10',
  discountPercent: 10,
  validUntil: '2025-12-31',
  isActive: true
});

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

  app.post("/api/validate-discount", (req, res) => {
    const { code } = req.body;
    const discount = discountStore.get(code);

    if (!discount || !discount.isActive || new Date(discount.validUntil) < new Date()) {
      return res.status(400).json({
        message: "Invalid or expired discount code"
      });
    }

    res.json({
      discountPercent: discount.discountPercent
    });
  });

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

  // Add return requests store
  const returnRequestStore = new Map<string, {
    id: number,
    orderRef: string,
    reason: string,
    status: 'pending' | 'approved' | 'rejected',
    items: Array<{
      productId: number,
      quantity: number,
      reason: string
    }>,
    additionalNotes?: string,
    createdAt: string
  }>();

  // Create a return request
  app.post("/api/returns", async (req, res) => {
    try {
      const data = insertReturnRequestSchema.parse(req.body);

      // Verify that the order exists
      const order = orderStore.get(data.orderRef);
      if (!order) {
        return res.status(404).json({
          message: "Order not found",
          details: "Cannot create return request for non-existent order"
        });
      }

      // Only allow returns for completed orders
      if (order.status !== 'completed') {
        return res.status(400).json({
          message: "Invalid order status",
          details: "Can only create return requests for completed orders"
        });
      }

      const returnRequest = {
        id: returnRequestStore.size + 1,
        orderRef: data.orderRef,
        reason: data.reason,
        status: 'pending' as const,
        items: data.items as Array<{
          productId: number;
          quantity: number;
          reason: string;
        }>,
        additionalNotes: data.additionalNotes,
        createdAt: new Date().toISOString()
      };

      returnRequestStore.set(String(returnRequest.id), returnRequest);

      res.status(201).json(returnRequest);
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

  // Get return requests for an order
  app.get("/api/returns/:orderRef", (req, res) => {
    const { orderRef } = req.params;

    const returns = Array.from(returnRequestStore.values())
      .filter(r => r.orderRef === orderRef)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(returns);
  });

  // Update return request status (for admin purposes)
  app.patch("/api/returns/:id/status", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const returnRequest = returnRequestStore.get(id);
    if (!returnRequest) {
      return res.status(404).json({
        message: "Return request not found"
      });
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
        details: "Status must be one of: pending, approved, rejected"
      });
    }

    returnRequest.status = status as 'pending' | 'approved' | 'rejected';
    returnRequestStore.set(id, returnRequest);

    res.json(returnRequest);
  });

  // Cart Routes
  app.get("/api/cart", async (req, res) => {
    try {
      // For now, use a simple user identification
      const userId = req.headers['x-user-id'] as string || 'anonymous';

      const dbCartItems = await storage.getCartItems(userId);

      // Fetch product details for each cart item
      const cartItems = await Promise.all(
        dbCartItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          if (!product) return null;

          return {
            product,
            quantity: item.quantity,
          };
        })
      );

      // Filter out any null items (where product wasn't found)
      const validCartItems = cartItems.filter(item => item !== null);

      res.json(validCartItems);
    } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).json({
        message: "Failed to fetch cart",
        details: "An error occurred while retrieving the cart items"
      });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'anonymous';
      const { productId, quantity = 1 } = req.body;

      // Validate the product exists
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({
          message: "Product not found",
          details: "The requested product does not exist"
        });
      }

      // Check if item already exists in cart
      const existingItems = await storage.getCartItems(userId);
      const existingItem = existingItems.find(item => item.productId === productId);

      if (existingItem) {
        // Update quantity instead of creating new item
        await storage.updateCartItemQuantity(
          userId,
          productId,
          existingItem.quantity + quantity
        );
      } else {
        // Add new item
        const cartItem = await storage.addCartItem({
          userId,
          productId,
          quantity,
          giftWrapType: null,
          giftWrapCost: 0
        });
      }

      const updatedCart = await storage.getCartItems(userId);
      res.json(updatedCart);
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({
        message: "Failed to add item to cart",
        details: "An error occurred while adding the item"
      });
    }
  });

  app.patch("/api/cart/:productId", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'anonymous';
      const productId = parseInt(req.params.productId);
      const { quantity } = req.body;

      if (isNaN(productId)) {
        return res.status(400).json({
          message: "Invalid product ID",
          details: "Product ID must be a number"
        });
      }

      await storage.updateCartItemQuantity(userId, productId, quantity);
      const updatedCart = await storage.getCartItems(userId);
      res.json(updatedCart);
    } catch (error) {
      console.error('Error updating cart:', error);
      res.status(500).json({
        message: "Failed to update cart",
        details: "An error occurred while updating the item quantity"
      });
    }
  });

  app.delete("/api/cart/:productId", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'anonymous';
      const productId = parseInt(req.params.productId);

      if (isNaN(productId)) {
        return res.status(400).json({
          message: "Invalid product ID",
          details: "Product ID must be a number"
        });
      }

      await storage.removeCartItem(userId, productId);
      const updatedCart = await storage.getCartItems(userId);
      res.json(updatedCart);
    } catch (error) {
      console.error('Error removing from cart:', error);
      res.status(500).json({
        message: "Failed to remove item from cart",
        details: "An error occurred while removing the item"
      });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'anonymous';
      await storage.clearCart(userId);
      res.json([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      res.status(500).json({
        message: "Failed to clear cart",
        details: "An error occurred while clearing the cart"
      });
    }
  });

  return createServer(app);
}