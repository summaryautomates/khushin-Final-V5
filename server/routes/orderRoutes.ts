import type { Express } from "express";
import { storage } from '../storage';
import { z } from "zod";
import { v4 as uuidv4 } from 'uuid';

/**
 * Order management API routes
 */
export function orderRoutes(app: Express) {
  // Get all orders for a user
  app.get("/api/orders", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Authentication required"
        });
      }

      const userId = req.user.id.toString();
      const orders = await storage.getOrdersByUserId(userId);
      
      res.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({
        message: "Failed to fetch orders"
      });
    }
  });

  // Get a specific order by reference
  app.get("/api/orders/:orderRef", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Authentication required"
        });
      }

      const { orderRef } = req.params;
      if (!orderRef) {
        return res.status(400).json({
          message: "Order reference is required"
        });
      }

      const order = await storage.getOrderByRef(orderRef);
      if (!order) {
        return res.status(404).json({
          message: "Order not found"
        });
      }

      // Check if the order belongs to the current user
      if (order.userId !== req.user.id.toString()) {
        return res.status(403).json({
          message: "You don't have permission to access this order"
        });
      }

      res.json(order);
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({
        message: "Failed to fetch order"
      });
    }
  });

  // Create a new order
  app.post("/api/orders", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Authentication required"
        });
      }

      const orderSchema = z.object({
        shipping: z.object({
          fullName: z.string().min(1, "Full name is required"),
          address: z.string().min(1, "Address is required"),
          city: z.string().min(1, "City is required"),
          state: z.string().min(1, "State is required"),
          pincode: z.string().min(1, "Pincode is required"),
          phone: z.string().min(10, "Valid phone number is required")
        }),
        // Payment method will be set later in the order status update
        // paymentMethod: z.enum(["cod", "upi", "creditcard"]),
        items: z.array(
          z.object({
            productId: z.number(),
            quantity: z.number().min(1),
            price: z.number().min(0),
            name: z.string()
          })
        ).nonempty("At least one item is required"),
        total: z.number().min(0)
      });

      const validationResult = orderSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid order data",
          errors: validationResult.error.errors
        });
      }

      const orderData = validationResult.data;
      const userId = req.user.id.toString();

      // Generate a unique order reference
      const orderRef = `ORDER-${uuidv4().substring(0, 8)}`;
      
      const newOrder = await storage.createOrder({
        orderRef,
        userId,
        status: 'pending',
        items: orderData.items,
        shipping: orderData.shipping,
        total: orderData.total
      });

      // Clear the cart after successful order creation
      await storage.clearCart(userId);

      res.status(201).json({
        message: "Order created successfully",
        order: newOrder
      });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({
        message: "Failed to create order"
      });
    }
  });

  // Update order status (e.g., for payment completion)
  app.patch("/api/orders/:orderRef/status", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Authentication required"
        });
      }

      const { orderRef } = req.params;
      if (!orderRef) {
        return res.status(400).json({
          message: "Order reference is required"
        });
      }

      const schema = z.object({
        status: z.enum(["completed", "failed"]),
        paymentMethod: z.enum(["upi", "cod"])
      });

      const validationResult = schema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid request data",
          errors: validationResult.error.errors
        });
      }

      const { status, paymentMethod } = validationResult.data;

      // Check if order exists
      const order = await storage.getOrderByRef(orderRef);
      if (!order) {
        return res.status(404).json({
          message: "Order not found"
        });
      }

      // Check if the order belongs to the current user
      if (order.userId !== req.user.id.toString()) {
        return res.status(403).json({
          message: "You don't have permission to modify this order"
        });
      }

      await storage.updateOrderStatus(orderRef, status, paymentMethod);
      const updatedOrder = await storage.getOrderByRef(orderRef);
      
      res.json({
        message: "Order status updated",
        order: updatedOrder
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({
        message: "Failed to update order status"
      });
    }
  });
}