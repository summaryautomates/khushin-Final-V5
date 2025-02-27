import type { Express } from "express";
import { storage } from "./storage";
import { insertOrderSchema } from "@shared/schema";
import { z } from "zod";
import { randomBytes } from "crypto";
import fetch from 'node-fetch';
import { ReplitDBStorage } from "./storage";
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

// Mock responses for development mode
const mockResponses = {
  product: (query: string) => `Here are some details about our products that match your query "${query}". We have a wide range of premium lighters and accessories.`,
  pricing: (query: string) => `Our products are premium quality and prices vary. For specific pricing on "${query}", I recommend checking our product catalog.`,
  shipping: () => "We offer worldwide shipping. Standard delivery takes 3-5 business days within India, and international shipping typically takes 7-14 business days.",
  default: (query: string) => `I understand you're asking about: ${query}. As your shopping assistant, I'm here to help with product information, shipping details, and any other questions about KHUSH.IN's premium products.`
};

// Create a test instance of ReplitDBStorage
const replitStorage = new ReplitDBStorage();

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

      // Test PostgreSQL (current storage)
      let postgresUser;
      try {
        postgresUser = await storage.createUser(testUser);
        console.log('PostgreSQL test successful:', {
          userId: postgresUser.id,
          username: postgresUser.username
        });

        // Verify PostgreSQL read operations
        const pgUserById = await storage.getUser(postgresUser.id);
        const pgUserByUsername = await storage.getUserByUsername(postgresUser.username);

        if (!pgUserById || !pgUserByUsername) {
          throw new Error('PostgreSQL read verification failed');
        }

        console.log('PostgreSQL read operations verified');
      } catch (pgError) {
        console.error('PostgreSQL test failed:', {
          error: pgError instanceof Error ? pgError.message : 'Unknown error',
          stack: pgError instanceof Error ? pgError.stack : undefined
        });
      }

      // Test Replit KV Store
      let replitUser;
      try {
        replitUser = await replitStorage.createUser({
          ...testUser,
          username: `${testUsername}_replit` // Use different username to avoid conflicts
        });
        console.log('Replit KV Store test successful:', {
          userId: replitUser.id,
          username: replitUser.username
        });

        // Verify Replit KV Store read operations
        const kvUserById = await replitStorage.getUser(replitUser.id);
        const kvUserByUsername = await replitStorage.getUserByUsername(replitUser.username);

        if (!kvUserById || !kvUserByUsername) {
          throw new Error('Replit KV Store read verification failed');
        }

        console.log('Replit KV Store read operations verified');
      } catch (replitError) {
        console.error('Replit KV Store test failed:', {
          error: replitError instanceof Error ? replitError.message : 'Unknown error',
          stack: replitError instanceof Error ? replitError.stack : undefined
        });
      }

      res.json({
        message: 'Database migration test completed',
        postgresql: {
          status: postgresUser ? 'success' : 'failed',
          user: postgresUser
        },
        replitDb: {
          status: replitUser ? 'success' : 'failed',
          user: replitUser
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Database migration test error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      res.status(500).json({
        message: "Database migration test failed",
        timestamp: new Date().toISOString()
      });
    }
  });

  // Add test route for product migration
  app.get("/api/test/product-migration", async (_req, res) => {
    try {
      // First, clear existing products
      const clearProducts = await storage.getProducts();
      console.log('Clearing existing products...');

      const luxuryLighters = [
        {
          name: "Diamond Celestial Elite",
          description: "A masterpiece adorned with ethically sourced diamonds set in a platinum-coated case. Features our innovative wind-resistant flame technology and comes with a premium leather carrying case.",
          price: 299900, // $2,999.00
          category: "luxury",
          images: ["/products/diamond-lighter.svg"],
          customizable: true,
          features: {
            material: "Platinum-Coated Steel",
            embellishment: "Natural Diamonds",
            mechanism: "Electronic Piezo",
            warranty: "Lifetime",
            special: "Certificate of Authenticity"
          }
        },
        {
          name: "Royal Golden Symphony",
          description: "An exquisite 18K gold-plated lighter featuring intricate hand-engraved patterns and a signature flame adjustment system. Each piece is individually numbered and comes in a handcrafted wooden presentation box.",
          price: 149900, // $1,499.00
          category: "luxury",
          images: ["/products/golden-lighter.svg"],
          customizable: true,
          features: {
            material: "18K Gold-Plated Brass",
            finish: "Hand-Engraved",
            mechanism: "Premium Flint Wheel",
            warranty: "Lifetime",
            special: "Individual Serial Number"
          }
        },
        {
          name: "Vintage 1923 Collection",
          description: "A meticulously recreated vintage design from our 1923 archives, featuring aged brass construction and our patented soft flame technology. Each piece tells a story of timeless craftsmanship.",
          price: 89900, // $899.00
          category: "luxury",
          images: ["/products/vintage-lighter.svg"],
          customizable: false,
          features: {
            material: "Aged Brass",
            finish: "Antique Patina",
            mechanism: "Traditional Flint",
            warranty: "25 Years",
            special: "Collector's Edition"
          }
        },
        {
          name: "Classic Elegance Signature",
          description: "The epitome of understated luxury, featuring brushed stainless steel construction, precision-engineered flame control, and our signature comfort-grip design. Perfect for daily sophistication.",
          price: 59900, // $599.00
          category: "luxury",
          images: ["/products/classic-lighter.svg"],
          customizable: true,
          features: {
            material: "Premium Stainless Steel",
            finish: "Brushed Metallic",
            mechanism: "Dual Flame System",
            warranty: "10 Years",
            special: "Ergonomic Design"
          }
        }
      ];

      console.log('Adding luxury lighters to database...');

      const createdProducts = await Promise.all(
        luxuryLighters.map(product => storage.createProduct(product))
      );

      console.log('Products created successfully:', {
        count: createdProducts.length,
        products: createdProducts.map(p => ({
          id: p.id,
          name: p.name
        }))
      });

      res.json({
        message: 'Luxury lighters added successfully',
        products: createdProducts
      });

    } catch (error) {
      console.error('Error adding luxury lighters:', error);
      res.status(500).json({
        message: "Failed to add luxury lighters",
        error: error instanceof Error ? error.message : 'Unknown error'
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

  app.post("/api/checkout", async (req, res) => {
    try {
      console.log("Checkout request received");

      if (!req.isAuthenticated()) {
        console.log("Unauthorized checkout attempt");
        return res.status(401).json({ message: "Authentication required" });
      }

      // Validate the order data
      const validationResult = insertOrderSchema.safeParse(req.body);

      if (!validationResult.success) {
        console.error("Order validation failed:", validationResult.error);
        return res.status(400).json({
          message: "Invalid order data",
          errors: validationResult.error.errors
        });
      }

      // Generate a unique order reference
      const orderRef = randomBytes(8).toString('hex');

      // Create the order in the database
      const orderData = {
        ...validationResult.data,
        orderRef
      };

      console.log("Creating order:", {
        ref: orderRef,
        userId: req.user?.id,
        itemCount: orderData.items.length,
        total: orderData.total
      });

      const order = await storage.createOrder(orderData);
      console.log("Order created successfully:", { ref: order.orderRef });

      // Create Stripe Checkout session
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'payment',
          success_url: `${req.protocol}://${req.get('host')}/checkout/success?ref=${orderRef}`,
          cancel_url: `${req.protocol}://${req.get('host')}/checkout/payment?ref=${orderRef}&status=cancelled`,
          customer_email: orderData.shipping.email,
          metadata: {
            orderRef: orderRef,
            userId: req.user?.id?.toString()
          },
          line_items: orderData.items.map(item => ({
            price_data: {
              currency: 'inr',
              product_data: {
                name: item.name,
              },
              unit_amount: item.price,
            },
            quantity: item.quantity,
          })),
          shipping_address_collection: {
            allowed_countries: ['IN'],
          },
        });

        // Return both the order reference and Stripe session URL
        res.json({
          message: "Order created successfully",
          redirectUrl: session.url || `/checkout/payment?ref=${orderRef}`,
          stripeSessionId: session.id
        });
      } catch (stripeError) {
        console.error('Stripe session creation error:', stripeError);
        // Fallback to traditional payment methods if Stripe fails
        res.json({
          message: "Order created successfully",
          redirectUrl: `/checkout/payment?ref=${orderRef}`
        });
      }
    } catch (error) {
      console.error('Error processing checkout:', error);
      res.status(500).json({
        message: "Failed to process checkout. Please try again."
      });
    }
  });

  // Add Stripe webhook handler
  app.post("/api/webhooks/stripe", async (req, res) => {
    const sig = req.headers['stripe-signature'];

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig as string,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );

      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object as Stripe.Checkout.Session;
          const orderRef = session.metadata?.orderRef;

          if (orderRef) {
            await storage.updateOrderStatus(orderRef, 'completed', 'stripe');
          }
          break;

        case 'checkout.session.expired':
          const expiredSession = event.data.object as Stripe.Checkout.Session;
          const expiredOrderRef = expiredSession.metadata?.orderRef;

          if (expiredOrderRef) {
            await storage.updateOrderStatus(expiredOrderRef, 'failed', 'stripe');
          }
          break;
        default:
          console.log(`Unhandled event type ${event.type}`)
      }

      res.json({ received: true });
    } catch (err) {
      console.error('Stripe webhook error:', err);
      res.status(400).send(`Webhook Error: ${err.message}`);
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