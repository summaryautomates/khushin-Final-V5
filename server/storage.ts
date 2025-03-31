import {
  type User,
  type InsertUser,
  type Order,
  type InsertOrder,
  type CartItem,
  type InsertCartItem,
  users,
  products,
  orders,
  cartItems
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import session from "express-session";
import MemoryStore from "memorystore";
import { db } from "./db";
import { sql } from "drizzle-orm";

const MemoryStoreSession = MemoryStore(session);

export interface IStorage {
  // User methods
  createUser(user: InsertUser): Promise<User>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  sessionStore: session.Store;
  // Product methods
  getProducts(): Promise<typeof products.$inferSelect[]>;
  getProductById(id: number): Promise<typeof products.$inferSelect | undefined>;
  getProductsByCategory(category: string): Promise<typeof products.$inferSelect[]>;
  // Order methods
  createOrder(order: InsertOrder): Promise<Order>;
  getOrderByRef(orderRef: string): Promise<Order | undefined>;
  updateOrderStatus(orderRef: string, status: 'completed' | 'failed', paymentMethod: 'upi' | 'cod'): Promise<void>;
  getOrdersByUserId(userId: string): Promise<Order[]>;
  // Cart methods
  getCartItems(userId: string): Promise<{ product: typeof products.$inferSelect, quantity: number, isGift: boolean, giftMessage?: string }[]>;
  addToCart(userId: string, productId: number, quantity: number, isGift?: boolean, giftMessage?: string): Promise<void>;
  removeFromCart(userId: string, productId: number): Promise<void>;
  updateCartItemQuantity(userId: string, productId: number, quantity: number): Promise<void>;
  updateCartItemGiftStatus(userId: string, productId: number, isGift: boolean, giftMessage?: string): Promise<void>;
  clearCart(userId: string): Promise<void>;
}

export class ReplitDBStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    console.log('Initializing ReplitDBStorage...');
    this.sessionStore = new MemoryStoreSession({
      checkPeriod: 86400000, // Prune expired entries every 24h
      ttl: 24 * 60 * 60 * 1000, // Time to live - 24 hours
      noDisposeOnSet: true,
      dispose: (sid: string) => {
        console.log('Session disposed:', { sid, timestamp: new Date().toISOString() });
      },
      stale: false,
      max: 1000
    });
    console.log('ReplitDBStorage initialized successfully');
  }

  async createUser(userData: InsertUser): Promise<User> {
    try {
      console.log('Creating user:', { username: userData.username });
      const [user] = await db.insert(users).values({
        username: userData.username,
        password: userData.password,
        email: userData.email,
        first_name: userData.first_name || null,
        last_name: userData.last_name || null
      }).returning();
      console.log('User created successfully:', { id: user.id, username: user.username });
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      console.log('Fetching user by ID:', id);
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      console.log('Fetching user by username:', username);
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error('Error fetching user by username:', error);
      return undefined;
    }
  }

  async getProducts(): Promise<typeof products.$inferSelect[]> {
    try {
      console.log('Fetching all products');
      return await db.select().from(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async getProductById(id: number): Promise<typeof products.$inferSelect | undefined> {
    try {
      console.log('Fetching product by ID:', id);
      const [product] = await db.select().from(products).where(eq(products.id, id));
      return product;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      return undefined;
    }
  }

  async getProductsByCategory(category: string): Promise<typeof products.$inferSelect[]> {
    try {
      console.log('Fetching products by category:', category);
      return await db.select().from(products).where(eq(products.category, category));
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  }

  async createOrder(orderData: InsertOrder): Promise<Order> {
    try {
      // Log the full order data to debug
      console.log('Creating order:', {
        userId: orderData.userId,
        itemCount: orderData.items.length,
        total: orderData.total,
        orderRef: orderData.orderRef // Added orderRef to logging
      });

      // Ensure orderRef is not null or undefined
      if (!orderData.orderRef) {
        throw new Error('Order reference is required');
      }

      // Ensure items and shipping are properly stringified
      let itemsString = typeof orderData.items === 'string' 
        ? orderData.items 
        : JSON.stringify(orderData.items);
        
      let shippingString = typeof orderData.shipping === 'string' 
        ? orderData.shipping 
        : JSON.stringify(orderData.shipping);

      // Insert order into database
      // Use the correct field names that match the schema
      const [order] = await db.insert(orders).values({
        orderRef: orderData.orderRef,
        userId: orderData.userId,
        status: orderData.status,
        total: orderData.total || 0,   // Ensure total has a default value
        items: itemsString,
        shipping: shippingString,
        createdAt: new Date(),
        lastUpdated: new Date()
      }).returning();

      // Parse items and shipping back to objects when returning
      try {
        const parsedItems = typeof order.items === 'string' 
          ? JSON.parse(order.items) 
          : order.items;
          
        const parsedShipping = typeof order.shipping === 'string' 
          ? JSON.parse(order.shipping) 
          : order.shipping;

        return {
          ...order,
          items: parsedItems,
          shipping: parsedShipping,
          estimatedDelivery: order.estimatedDelivery ? order.estimatedDelivery.toISOString() : null
        };
      } catch (parseError) {
        console.error('Error parsing order data:', parseError);
        // Return the order with unparsed data rather than failing completely
        return {
          ...order,
          estimatedDelivery: order.estimatedDelivery ? order.estimatedDelivery.toISOString() : null
        } as unknown as Order;
      }
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getOrderByRef(orderRef: string): Promise<Order | undefined> {
    try {
      console.log('Fetching order by ref:', orderRef);
      const [order] = await db.select().from(orders).where(eq(orders.orderRef, orderRef));
      if (!order) return undefined;

      try {
        // Parse items and shipping from string to object
        const parsedItems = typeof order.items === 'string' 
          ? JSON.parse(order.items) 
          : order.items;
          
        const parsedShipping = typeof order.shipping === 'string' 
          ? JSON.parse(order.shipping) 
          : order.shipping;

        return {
          ...order,
          items: parsedItems,
          shipping: parsedShipping,
          estimatedDelivery: order.estimatedDelivery ? order.estimatedDelivery.toISOString() : null
        };
      } catch (parseError) {
        console.error('Error parsing order data:', parseError);
        // Return the order with unparsed data rather than failing completely
        return {
          ...order,
          estimatedDelivery: order.estimatedDelivery ? order.estimatedDelivery.toISOString() : null
        } as unknown as Order;
      }
    } catch (error) {
      console.error('Error fetching order by ref:', error);
      return undefined;
    }
  }

  async updateOrderStatus(
    orderRef: string,
    status: 'completed' | 'failed',
    paymentMethod: 'upi' | 'cod'
  ): Promise<void> {
    try {
      console.log('Updating order status:', {
        ref: orderRef,
        status,
        paymentMethod
      });

      await db.update(orders)
        .set({
          status,
          paymentMethod,
          lastUpdated: new Date()
        })
        .where(eq(orders.orderRef, orderRef));

      console.log('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    try {
      console.log('Fetching orders for user:', userId);
      const ordersList = await db.select()
        .from(orders)
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.createdAt));

      // Parse items and shipping for each order with error handling
      return ordersList.map(order => {
        try {
          const parsedItems = typeof order.items === 'string' 
            ? JSON.parse(order.items) 
            : order.items;
            
          const parsedShipping = typeof order.shipping === 'string' 
            ? JSON.parse(order.shipping) 
            : order.shipping;

          return {
            ...order,
            items: parsedItems,
            shipping: parsedShipping,
            estimatedDelivery: order.estimatedDelivery ? order.estimatedDelivery.toISOString() : null
          };
        } catch (parseError) {
          console.error('Error parsing order data:', parseError);
          // Return the order with unparsed data rather than failing completely
          return {
            ...order,
            estimatedDelivery: order.estimatedDelivery ? order.estimatedDelivery.toISOString() : null
          } as unknown as Order;
        }
      });
    } catch (error) {
      console.error('Error fetching orders for user:', error);
      throw error;
    }
  }

  // Cart methods implementation
  async getCartItems(userId: string): Promise<{ product: typeof products.$inferSelect, quantity: number, isGift: boolean, giftMessage?: string }[]> {
    try {
      console.log('Fetching cart items for user:', userId);
      
      // Join cart_items with products to get product details
      const items = await db.select({
        cart: cartItems,
        product: products
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId));
      
      // Transform the result to match the expected return type
      return items.map(item => ({
        product: item.product,
        quantity: item.cart.quantity,
        isGift: item.cart.isGift,
        giftMessage: item.cart.giftMessage || undefined
      }));
    } catch (error) {
      console.error('Error fetching cart items:', error);
      throw error;
    }
  }

  async addToCart(userId: string, productId: number, quantity: number, isGift: boolean = false, giftMessage?: string): Promise<void> {
    try {
      console.log('Adding item to cart:', { userId, productId, quantity, isGift });
      
      // Check if the item already exists in the cart
      const [existingItem] = await db.select()
        .from(cartItems)
        .where(and(
          eq(cartItems.userId, userId),
          eq(cartItems.productId, productId)
        ));
      
      if (existingItem) {
        // Update the quantity if the item already exists
        await db.update(cartItems)
          .set({
            quantity: existingItem.quantity + quantity,
            isGift,
            giftMessage: giftMessage || null,
            updatedAt: new Date()
          })
          .where(eq(cartItems.id, existingItem.id));
        
        console.log('Updated cart item quantity');
      } else {
        // Insert a new cart item
        await db.insert(cartItems).values({
          userId,
          productId,
          quantity,
          isGift,
          giftMessage: giftMessage || null,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log('Added new item to cart');
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  }

  async removeFromCart(userId: string, productId: number): Promise<void> {
    try {
      console.log('Removing item from cart:', { userId, productId });
      
      await db.delete(cartItems)
        .where(and(
          eq(cartItems.userId, userId),
          eq(cartItems.productId, productId)
        ));
      
      console.log('Item removed from cart');
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw error;
    }
  }

  async updateCartItemQuantity(userId: string, productId: number, quantity: number): Promise<void> {
    try {
      console.log('Updating cart item quantity:', { userId, productId, quantity });
      
      if (quantity <= 0) {
        // If quantity is 0 or negative, remove the item from the cart
        await this.removeFromCart(userId, productId);
        return;
      }
      
      await db.update(cartItems)
        .set({
          quantity,
          updatedAt: new Date()
        })
        .where(and(
          eq(cartItems.userId, userId),
          eq(cartItems.productId, productId)
        ));
      
      console.log('Cart item quantity updated');
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      throw error;
    }
  }

  async updateCartItemGiftStatus(userId: string, productId: number, isGift: boolean, giftMessage?: string): Promise<void> {
    try {
      console.log('Updating cart item gift status:', { userId, productId, isGift, giftMessage });
      
      await db.update(cartItems)
        .set({
          isGift,
          giftMessage: giftMessage || null,
          updatedAt: new Date()
        })
        .where(and(
          eq(cartItems.userId, userId),
          eq(cartItems.productId, productId)
        ));
      
      console.log('Cart item gift status updated');
    } catch (error) {
      console.error('Error updating cart item gift status:', error);
      throw error;
    }
  }

  async clearCart(userId: string): Promise<void> {
    try {
      console.log('Clearing cart for user:', userId);
      
      await db.delete(cartItems)
        .where(eq(cartItems.userId, userId));
      
      console.log('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }
}

export const storage = new ReplitDBStorage();