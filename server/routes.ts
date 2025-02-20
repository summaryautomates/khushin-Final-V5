import type { Express } from "express";
import { storage } from "./storage";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express) {
  // Set up authentication first
  await setupAuth(app);

  // Basic routes setup
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
  });

  // Cart Routes
  app.get("/api/cart", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'];
      if (!userId) {
        return res.status(401).json({
          message: "Unauthorized",
          details: "User ID is required"
        });
      }

      const cartItems = await storage.getCartItems(userId.toString());
      const cartWithProducts = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            product,
            quantity: item.quantity
          };
        })
      );

      res.json(cartWithProducts.filter(item => item.product !== undefined));
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
      const userId = req.headers['x-user-id'];
      if (!userId) {
        return res.status(401).json({
          message: "Unauthorized",
          details: "User ID is required"
        });
      }

      const { productId, quantity = 1 } = req.body;
      const product = await storage.getProduct(productId);

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
          details: "The requested product does not exist"
        });
      }

      await storage.addCartItem({
        userId: userId.toString(),
        productId,
        quantity,
        giftWrapType: null,
        giftWrapCost: 0
      });

      const cartItems = await storage.getCartItems(userId.toString());
      const cartWithProducts = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            product,
            quantity: item.quantity
          };
        })
      );

      res.json(cartWithProducts.filter(item => item.product !== undefined));
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({
        message: "Failed to add item to cart",
        details: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  });

  app.delete("/api/cart/:productId", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'];
      if (!userId) {
        return res.status(401).json({
          message: "Unauthorized",
          details: "User ID is required"
        });
      }

      const productId = parseInt(req.params.productId);
      if (isNaN(productId)) {
        return res.status(400).json({
          message: "Invalid product ID",
          details: "Product ID must be a number"
        });
      }

      await storage.removeCartItem(userId.toString(), productId);
      const cartItems = await storage.getCartItems(userId.toString());
      const cartWithProducts = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            product,
            quantity: item.quantity
          };
        })
      );

      res.json(cartWithProducts.filter(item => item.product !== undefined));
    } catch (error) {
      console.error('Error removing from cart:', error);
      res.status(500).json({
        message: "Failed to remove item from cart",
        details: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'];
      if (!userId) {
        return res.status(401).json({
          message: "Unauthorized",
          details: "User ID is required"
        });
      }
      await storage.clearCart(userId.toString());
      res.json([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      res.status(500).json({
        message: "Failed to clear cart",
        details: "An error occurred while clearing the cart"
      });
    }
  });


  app.get("/api/products/category/:category", async (req: any, res: any) => {
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
  });

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

  // Create a return request
  app.post("/api/returns", async (req, res) => {
    try {
      const data = returnRequestSchema.parse(req.body);

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
        items: data.items,
        additionalNotes: data.additionalNotes || undefined,
        createdAt: new Date().toISOString()
      };

      returnRequestStore.set(String(returnRequest.id), returnRequest);

      res.status(201).json(returnRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid input",
          details: fromZodError(error).message
        });
      }
      console.error('Return request error:', error);
      res.status(500).json({
        message: "Internal server error",
        details: "Failed to create return request"
      });
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

  // Enhanced order endpoints
  app.post("/api/orders", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'anonymous';
      const orderData = insertOrderSchema.parse({ ...req.body, userId });

      // Generate order reference
      const orderRef = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Calculate total from items
      const total = await calculateSubtotal(orderData.items);

      // Create the order with all required fields
      const order = await storage.createOrder({
        ...orderData,
        orderRef,
        total,
        status: 'pending',
        items: await Promise.all(
          orderData.items.map(async item => {
            const product = await storage.getProduct(item.productId);
            return {
              productId: item.productId,
              quantity: item.quantity,
              price: product?.price || 0,
              name: product?.name || 'Unknown Product'
            };
          })
        )
      });

      // Create initial status history
      await storage.addOrderStatusHistory({
        orderId: order.id,
        status: order.status,
        location: 'Order Processing Center',
        description: 'Order received and confirmed'
      });

      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid input",
          details: fromZodError(error).message
        });
      }
      console.error('Order creation error:', error);
      res.status(500).json({
        message: "Failed to create order",
        details: "An error occurred while creating the order"
      });
    }
  });

  app.get("/api/orders/:orderRef", async (req, res) => {
    try {
      const { orderRef } = req.params;
      const order = await storage.getOrder(orderRef);

      if (!order) {
        return res.status(404).json({
          message: "Order not found",
          details: "The specified order reference could not be found"
        });
      }

      const statusHistory = await storage.getOrderStatusHistory(order.id);

      res.json({
        ...order,
        statusHistory
      });
    } catch (error) {
      console.error('Order fetch error:', error);
      res.status(500).json({
        message: "Failed to fetch order",
        details: "An error occurred while retrieving the order"
      });
    }
  });

  app.get("/api/orders/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const orders = await storage.getOrdersByUserId(userId);
      res.json(orders);
    } catch (error) {
      console.error('User orders fetch error:', error);
      res.status(500).json({
        message: "Failed to fetch orders",
        details: "An error occurred while retrieving the orders"
      });
    }
  });

  app.patch("/api/orders/:orderRef/status", async (req, res) => {
    try {
      const { orderRef } = req.params;
      const { status, trackingNumber, location, description } = req.body;

      const order = await storage.updateOrderStatus(orderRef, status, trackingNumber);

      if (!order) {
        return res.status(404).json({
          message: "Order not found",
          details: "The specified order reference could not be found"
        });
      }

      // Add status history
      await storage.addOrderStatusHistory({
        orderId: order.id,
        status,
        location,
        description
      });

      res.json(order);
    } catch (error) {
      console.error('Order status update error:', error);
      res.status(500).json({
        message: "Failed to update order status",
        details: "An error occurred while updating the order status"
      });
    }
  });

  const returnRequestSchema = z.object({
    orderRef: z.string(),
    reason: z.string().min(10, "Please provide a detailed reason"),
    items: z.array(z.object({
      productId: z.number(),
      quantity: z.number().min(1, "Quantity must be at least 1"),
      reason: z.string().min(1, "Item-specific reason is required")
    })).min(1, "At least one item must be selected"),
    additionalNotes: z.string().optional().nullable()
  });

  const insertContactMessageSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    message: z.string().min(10)
  });


  const insertOrderSchema = z.object({
    userId: z.string(),
    items: z.array(z.object({
      productId: z.number(),
      quantity: z.number().min(1)
    })),
    shipping: z.object({
      fullName: z.string(),
      address: z.string(),
      city: z.string(),
      state: z.string(),
      pincode: z.string(),
      phone: z.string()
    }),
    payment: z.object({
      method: z.string(),
      status: z.string()
    }),
    discountCode: z.string().optional().nullable()
  });

  const paymentStatusSchema = z.object({
    status: z.enum(['pending', 'completed', 'failed'])
  });


  // Storage for various data
  const paymentStore = new Map();
  const discountStore = new Map();
  const orderStore = new Map();
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

  // Add some sample discount codes
  discountStore.set('WELCOME10', {
    code: 'WELCOME10',
    discountPercent: 10,
    validUntil: '2025-12-31',
    isActive: true
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

  return app;
}