import type { Express } from "express";
import { storage } from '../storage';
import { z } from "zod";

/**
 * Cart related API routes
 */
export function cartRoutes(app: Express) {
  // Get cart items
  app.get("/api/cart", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Authentication required"
        });
      }

      const userId = req.user.id.toString();
      const cartItems = await storage.getCartItems(userId);
      
      res.json(cartItems);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      res.status(500).json({
        message: "Failed to fetch cart items"
      });
    }
  });

  // Add item to cart or update quantity
  app.post("/api/cart", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Authentication required"
        });
      }

      const schema = z.object({
        productId: z.number(),
        quantity: z.number().min(1),
        isGift: z.boolean().optional().default(false),
        giftMessage: z.string().optional()
      });

      const validationResult = schema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid request data",
          errors: validationResult.error.errors
        });
      }

      const { productId, quantity, isGift, giftMessage } = validationResult.data;
      const userId = req.user.id.toString();

      // Check if product exists
      const product = await storage.getProductById(productId);
      if (!product) {
        return res.status(404).json({
          message: "Product not found"
        });
      }

      // First check if this product is already in the cart
      const cartItems = await storage.getCartItems(userId);
      const existingItem = cartItems.find(item => item.product.id === productId);

      if (existingItem) {
        // Update quantity if it already exists
        await storage.updateCartItemQuantity(userId, productId, quantity);
      } else {
        // Add as new item if it doesn't exist
        await storage.addToCart(userId, productId, quantity, isGift, giftMessage);
      }

      const updatedCart = await storage.getCartItems(userId);
      
      res.json({
        message: existingItem ? "Cart item quantity updated" : "Item added to cart",
        cart: updatedCart
      });
    } catch (error) {
      console.error('Error updating cart:', error);
      res.status(500).json({
        message: "Failed to update cart"
      });
    }
  });

  // Remove item from cart
  app.delete("/api/cart/:productId", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Authentication required"
        });
      }

      const productId = parseInt(req.params.productId);
      if (isNaN(productId)) {
        return res.status(400).json({
          message: "Invalid product ID format"
        });
      }

      const userId = req.user.id.toString();
      await storage.removeFromCart(userId, productId);
      const updatedCart = await storage.getCartItems(userId);
      
      res.json({
        message: "Item removed from cart",
        cart: updatedCart
      });
    } catch (error) {
      console.error('Error removing item from cart:', error);
      res.status(500).json({
        message: "Failed to remove item from cart"
      });
    }
  });

  // Update cart item quantity
  app.patch("/api/cart/:productId/quantity", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Authentication required"
        });
      }

      const productId = parseInt(req.params.productId);
      if (isNaN(productId)) {
        return res.status(400).json({
          message: "Invalid product ID format"
        });
      }

      const schema = z.object({
        quantity: z.number().min(1)
      });

      const validationResult = schema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid request data",
          errors: validationResult.error.errors
        });
      }

      const { quantity } = validationResult.data;
      const userId = req.user.id.toString();

      await storage.updateCartItemQuantity(userId, productId, quantity);
      const updatedCart = await storage.getCartItems(userId);
      
      res.json({
        message: "Cart item quantity updated",
        cart: updatedCart
      });
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      res.status(500).json({
        message: "Failed to update cart item quantity"
      });
    }
  });

  // Update gift status
  app.patch("/api/cart/:productId/gift", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Authentication required"
        });
      }

      const productId = parseInt(req.params.productId);
      if (isNaN(productId)) {
        return res.status(400).json({
          message: "Invalid product ID format"
        });
      }

      const schema = z.object({
        isGift: z.boolean(),
        giftMessage: z.string().optional()
      });

      const validationResult = schema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid request data",
          errors: validationResult.error.errors
        });
      }

      const { isGift, giftMessage } = validationResult.data;
      const userId = req.user.id.toString();

      await storage.updateCartItemGiftStatus(userId, productId, isGift, giftMessage);
      const updatedCart = await storage.getCartItems(userId);
      
      res.json({
        message: "Gift status updated",
        cart: updatedCart
      });
    } catch (error) {
      console.error('Error updating gift status:', error);
      res.status(500).json({
        message: "Failed to update gift status"
      });
    }
  });

  // Clear cart
  app.delete("/api/cart", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Authentication required"
        });
      }

      const userId = req.user.id.toString();
      await storage.clearCart(userId);
      
      res.json({
        message: "Cart cleared",
        cart: []
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      res.status(500).json({
        message: "Failed to clear cart"
      });
    }
  });
}