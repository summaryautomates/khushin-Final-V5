import {
  type Product,
  type BlogPost,
  type ContactMessage,
  type InsertProduct,
  type InsertBlogPost,
  type InsertContactMessage,
  type CartItem,
  type InsertCartItem,
  type Order,
  type OrderStatusHistory,
  type InsertOrder,
  type GiftOrder,
  type InsertGiftOrder,
} from "@shared/schema";
import Database from "@replit/database";
import session from "express-session";
import { type User, type InsertUser } from "@shared/schema";
import MemoryStore from "memorystore";

const MemoryStoreSession = MemoryStore(session);

// Initialize Replit Database client
const replitDb = new Database();

// Helper functions for key management
const keys = {
  user: (id: number) => `users:${id}`,
  userByUsername: (username: string) => `users:username:${username}`,
  userNextId: () => 'users:next_id',
  test: () => "test_key",
};

// Helper function to generate sequential IDs for users
async function getNextUserId(): Promise<number> {
  try {
    const currentId = await replitDb.get(keys.userNextId()) as number | null;
    const nextId = (currentId || 0) + 1;
    await replitDb.set(keys.userNextId(), nextId);
    return nextId;
  } catch (error) {
    console.error('Error generating next user ID:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;

  // Blog posts
  getBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(slug: string): Promise<BlogPost | undefined>;

  // Contact messages
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;

  // Cart methods
  getCartItems(userId: string): Promise<CartItem[]>;
  addCartItem(item: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(userId: string, productId: number, quantity: number): Promise<void>;
  removeCartItem(userId: string, productId: number): Promise<void>;
  clearCart(userId: string): Promise<void>;

  // Order methods
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(orderRef: string): Promise<Order | undefined>;
  getOrdersByUserId(userId: string): Promise<Order[]>;
  getOrderByRef(orderRef: string): Promise<Order | undefined>;
  updateOrderStatus(orderRef: string, status: string, method?: string): Promise<Order>;
  updateOrderTracking(orderRef: string, trackingStatus: string, estimatedDelivery?: string): Promise<Order>;

  // Order Status History methods
  addOrderStatusHistory(history: OrderStatusHistory): Promise<OrderStatusHistory>;
  getOrderStatusHistory(orderId: number): Promise<OrderStatusHistory[]>;

  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Session store
  sessionStore: session.Store;

  // Gift order methods
  createGiftOrder(giftOrder: InsertGiftOrder): Promise<GiftOrder>;
  getGiftOrder(orderId: number): Promise<GiftOrder | undefined>;
  getGiftOrderByRedemptionCode(code: string): Promise<GiftOrder | undefined>;
  updateGiftOrderRedemptionStatus(orderId: number, isRedeemed: boolean): Promise<GiftOrder>;
  getGiftOrdersBySender(senderUserId: string): Promise<GiftOrder[]>;
  updateCartItemGiftStatus(userId: string, productId: number, isGift: boolean, giftMessage?: string): Promise<void>;
}

export class ReplitDBStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStoreSession({
      checkPeriod: 86400000, // Prune expired entries every 24h
      ttl: 24 * 60 * 60 * 1000, // Time to live - 24 hours
      noDisposeOnSet: true, // Improve performance by not disposing old sessions on set
      dispose: (sid: string) => {
        console.log('Session disposed:', { sid, timestamp: new Date().toISOString() });
      },
      stale: false, // Don't serve stale sessions
      max: 1000 // Maximum number of sessions to store
    });
  }

  // User methods - Fully implemented
  async getUser(id: number): Promise<User | undefined> {
    try {
      console.log('ReplitDB: Fetching user by ID:', { id });
      const userStr = await replitDb.get(keys.user(id)) as string | null;
      if (!userStr) {
        console.log('ReplitDB: User not found:', { id });
        return undefined;
      }
      const user = JSON.parse(userStr);
      console.log('ReplitDB: User found:', { id });
      return user;
    } catch (error) {
      console.error('ReplitDB: Error fetching user:', {
        id,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      console.log('ReplitDB: Fetching user by username:', { username });
      const userStr = await replitDb.get(keys.userByUsername(username)) as string | null;
      if (!userStr) {
        console.log('ReplitDB: User not found:', { username });
        return undefined;
      }
      const user = JSON.parse(userStr);
      console.log('ReplitDB: User found:', { username });
      return user;
    } catch (error) {
      console.error('ReplitDB: Error fetching user by username:', {
        username,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      console.log('ReplitDB: Creating new user:', { username: user.username });

      // Check if username already exists
      const existing = await this.getUserByUsername(user.username);
      if (existing) {
        throw new Error('Username already exists');
      }

      const id = await getNextUserId();
      const newUser: User = {
        ...user,
        id,
        createdAt: new Date(),
        firstName: user.firstName || null,
        lastName: user.lastName || null
      };

      // Store user by both ID and username
      await replitDb.set(keys.user(id), JSON.stringify(newUser));
      await replitDb.set(keys.userByUsername(user.username), JSON.stringify(newUser));

      console.log('ReplitDB: User created successfully:', { id, username: user.username });
      return newUser;
    } catch (error) {
      console.error('ReplitDB: Error creating user:', {
        username: user.username,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  // Other methods - Return dummy responses for now
  async getProducts(): Promise<Product[]> { return []; }
  async getProduct(_id: number): Promise<Product | undefined> { return undefined; }
  async getProductsByCategory(_category: string): Promise<Product[]> { return []; }
  async getBlogPosts(): Promise<BlogPost[]> { return []; }
  async getBlogPost(_slug: string): Promise<BlogPost | undefined> { return undefined; }
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> { return { id: 0, ...message }; }
  async getCartItems(_userId: string): Promise<CartItem[]> { return []; }
  async addCartItem(item: InsertCartItem): Promise<CartItem> { return { id: 0, ...item }; }
  async updateCartItemQuantity(_userId: string, _productId: number, _quantity: number): Promise<void> {}
  async removeCartItem(_userId: string, _productId: number): Promise<void> {}
  async clearCart(_userId: string): Promise<void> {}
  async createOrder(order: InsertOrder): Promise<Order> { 
    return { 
      id: 0, 
      orderRef: 'dummy', 
      lastUpdated: new Date(),
      createdAt: new Date(),
      trackingNumber: null,
      trackingStatus: null,
      estimatedDelivery: null,
      ...order 
    }; 
  }
  async getOrder(_orderRef: string): Promise<Order | undefined> { return undefined; }
  async getOrdersByUserId(_userId: string): Promise<Order[]> { return []; }
  async getOrderByRef(_orderRef: string): Promise<Order | undefined> { return undefined; }
  async updateOrderStatus(_orderRef: string, _status: string, _method?: string): Promise<Order> { throw new Error("Not implemented"); }
  async updateOrderTracking(_orderRef: string, _trackingStatus: string, _estimatedDelivery?: string): Promise<Order> { throw new Error("Not implemented"); }
  async addOrderStatusHistory(_history: OrderStatusHistory): Promise<OrderStatusHistory> { throw new Error("Not implemented"); }
  async getOrderStatusHistory(_orderId: number): Promise<OrderStatusHistory[]> { return []; }
  async createGiftOrder(_giftOrder: InsertGiftOrder): Promise<GiftOrder> { throw new Error("Not implemented"); }
  async getGiftOrder(_orderId: number): Promise<GiftOrder | undefined> { return undefined; }
  async getGiftOrderByRedemptionCode(_code: string): Promise<GiftOrder | undefined> { return undefined; }
  async updateGiftOrderRedemptionStatus(_orderId: number, _isRedeemed: boolean): Promise<GiftOrder> { throw new Error("Not implemented"); }
  async getGiftOrdersBySender(_senderUserId: string): Promise<GiftOrder[]> { return []; }
  async updateCartItemGiftStatus(_userId: string, _productId: number, _isGift: boolean, _giftMessage?: string): Promise<void> {}
}

// Export ReplitDBStorage as the main storage implementation
export const storage = new ReplitDBStorage();