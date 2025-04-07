import type { Express } from "express";
import { storage } from '../storage';
import { z } from "zod";
import { insertOrderSchema } from "@shared/schema";
import { randomBytes } from "crypto";

/**
 * Payment and checkout related API routes
 */
export function paymentRoutes(app: Express) {
  // Checkout endpoint
  app.post("/api/checkout", async (req, res) => {
    try {
      console.log("Checkout request received");

      if (!req.isAuthenticated()) {
        console.log("Unauthorized checkout attempt");
        return res.status(401).json({ message: "Authentication required" });
      }

      // Log the received data
      console.log("Checkout payload received:", {
        userId: req.body.userId,
        itemCount: req.body.items?.length,
        hasShipping: !!req.body.shipping
      });

      // Validate the order data
      const validationResult = insertOrderSchema.safeParse(req.body);

      if (!validationResult.success) {
        console.error("Order validation failed:", validationResult.error);
        return res.status(400).json({
          message: "Invalid order data",
          errors: validationResult.error.errors
        });
      }

      // Ensure user ID matches the authenticated user
      if (req.user && validationResult.data.userId !== req.user.id.toString()) {
        console.log("User ID mismatch:", {
          authUserId: req.user.id,
          payloadUserId: validationResult.data.userId
        });
        return res.status(400).json({
          message: "User ID mismatch"
        });
      }

      // Generate a unique order reference
      const orderRef = randomBytes(8).toString('hex');

      // Create the order in the database
      const orderData = {
        ...validationResult.data, 
        orderRef, // Ensure orderRef is explicitly set
        status: 'pending' as const
      };

      // Validate shipping data explicitly
      if (!orderData.shipping || 
          !orderData.shipping.fullName || 
          !orderData.shipping.address || 
          !orderData.shipping.city || 
          !orderData.shipping.state || 
          !orderData.shipping.pincode || 
          !orderData.shipping.phone) {
        return res.status(400).json({
          message: "Incomplete shipping information",
          errors: ["Shipping information is required"]
        });
      }

      // Validate items
      if (!orderData.items || orderData.items.length === 0) {
        return res.status(400).json({
          message: "No items in order",
          errors: ["At least one item is required"]
        });
      }

      console.log("Creating order:", {
        ref: orderRef,
        userId: req.user?.id,
        itemCount: orderData.items.length,
        total: orderData.total,
        hasOrderRef: !!orderData.orderRef // Log whether orderRef is set
      });

      const order = await storage.createOrder(orderData);
      console.log("Order created successfully:", { ref: order.orderRef });

      // Redirect to payment page
      res.json({
        message: "Order created successfully",
        redirectUrl: `/checkout/payment?ref=${orderRef}`,
        orderRef
      });
    } catch (error) {
      console.error('Error processing checkout:', error);
      res.status(500).json({
        message: "Failed to process checkout. Please try again."
      });
    }
  });

  // Payment status update endpoint
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

  // Payment details endpoint
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
}