import type { Express } from "express";
import { storage } from "./storage";
import { insertOrderSchema } from "@shared/schema";
import { z } from "zod";
import { randomBytes } from "crypto";
import fetch from 'node-fetch';

// Mock responses for development mode
const mockResponses = {
  product: (query: string) => `Here are some details about our products that match your query "${query}". We have a wide range of premium lighters and accessories.`,
  pricing: (query: string) => `Our products are premium quality and prices vary. For specific pricing on "${query}", I recommend checking our product catalog.`,
  shipping: () => "We offer worldwide shipping. Standard delivery takes 3-5 business days within India, and international shipping typically takes 7-14 business days.",
  default: (query: string) => `I understand you're asking about: ${query}. As your shopping assistant, I'm here to help with product information, shipping details, and any other questions about KHUSH.IN's premium products.`
};

export async function registerRoutes(app: Express) {
  // Add test route for database migration
  app.get("/api/test/db-migration", async (_req, res) => {
    try {
      const testUsername = `test_user_${Date.now()}`;
      const testUser = {
        username: testUsername,
        password: "test_password_123",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User"
      };

      console.log('Testing database migration - Creating test user');

      const user = await storage.createUser(testUser);
      console.log('Test successful:', { 
        userId: user.id,
        username: user.username 
      });

      // Verify read operations
      const userById = await storage.getUser(user.id);
      const userByUsername = await storage.getUserByUsername(user.username);

      if (!userById || !userByUsername) {
        throw new Error('Read verification failed');
      }

      console.log('Read operations verified');

      res.json({
        message: 'Database test completed',
        status: 'success',
        user,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Database test error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      res.status(500).json({ 
        message: "Database test failed",
        timestamp: new Date().toISOString()
      });
    }
  });

  // Add test route for product migration
  app.get("/api/test/product-migration", async (_req, res) => {
    try {
      const testProduct = {
        name: `Test Product ${Date.now()}`,
        description: "A test product for migration verification",
        price: 99.99,
        category: "test",
        images: ["test-image.jpg"],
        customizable: false,
        features: {
          color: "blue",
          size: "medium"
        }
      };

      console.log('Testing product migration - Creating test product');

      // Create a new product
      const product = await storage.createProduct(testProduct);
      console.log('Product created successfully:', { 
        id: product.id,
        name: product.name 
      });

      // Verify read operations
      const productById = await storage.getProduct(product.id);
      const productsByCategory = await storage.getProductsByCategory(product.category);
      const allProducts = await storage.getProducts();

      if (!productById) {
        throw new Error('Product read verification failed');
      }

      res.json({
        message: 'Product migration test completed',
        success: true,
        product: productById,
        categoryCount: productsByCategory.length,
        totalProducts: allProducts.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Product migration test error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      res.status(500).json({ 
        message: "Product migration test failed",
        timestamp: new Date().toISOString()
      });
    }
  });

  // Existing routes
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

      const { status } = validationResult.data;
      console.log("Updating order status:", {
        ref: order.orderRef,
        status
      });

      await storage.updateOrderStatus(order.orderRef, status);
      console.log("Order status updated successfully");

      res.json({ message: "Payment status updated successfully" });
    } catch (error) {
      console.error('Error updating payment status:', error);
      res.status(500).json({ message: "Failed to update payment status" });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const messageSchema = z.object({
        message: z.string().min(1, "Message is required")
      });

      const validationResult = messageSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid request data",
          errors: validationResult.error.errors
        });
      }

      if (!process.env.DEEPSEEK_API_KEY) {
        console.error('DeepSeek API key is missing');
        return res.status(503).json({
          message: "AI service is temporarily unavailable. Please try again later."
        });
      }

      try {
        console.log('Making request to DeepSeek API...');
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              {
                role: "system",
                content: "You are an AI shopping assistant for KHUSH.IN, a premium e-commerce platform. Always be helpful, concise, and polite. Focus on providing accurate product information and shopping assistance."
              },
              {
                role: "user",
                content: validationResult.data.message
              }
            ],
            max_tokens: 1000,
            temperature: 0.7
          })
        });

        const data = await response.json();
        console.log('DeepSeek API response:', data);

        if (!response.ok) {
          console.error('DeepSeek API error:', data);
          throw new Error(data.error?.message || 'Failed to get AI response');
        }

        res.json({ message: data.choices[0].message.content });
      } catch (apiError) {
        console.error('DeepSeek API error:', apiError);

        // For development environment, provide intelligent mock responses
        if (process.env.NODE_ENV !== 'production') {
          const query = validationResult.data.message.toLowerCase();
          let response;

          if (query.includes('product') || query.includes('lighter')) {
            response = mockResponses.product(query);
          } else if (query.includes('price') || query.includes('cost')) {
            response = mockResponses.pricing(query);
          } else if (query.includes('shipping') || query.includes('delivery')) {
            response = mockResponses.shipping();
          } else {
            response = mockResponses.default(query);
          }

          return res.json({ message: response });
        }

        throw apiError; // Re-throw to be caught by outer try-catch
      }
    } catch (error) {
      console.error('Error in AI chat:', error);
      res.status(500).json({ 
        message: "An unexpected error occurred. Please try again later."
      });
    }
  });
}