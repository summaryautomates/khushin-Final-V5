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
import { pgTable, text, serial, integer, boolean, jsonb, foreignKey, timestamp } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import session from "express-session";
import { type User, type InsertUser } from "@shared/schema";
import connectPg from "connect-pg-simple";
import Database from "@replit/database";

const PostgresStore = connectPg(session);

// Initialize both databases
const replitDb = new Database();
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool);

// Helper functions for Replit DB key management
const keys = {
  test: () => "test_key",
  // We'll add more key functions as we migrate features
};

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

  // Add new method for updating gift status
  updateCartItemGiftStatus(userId: string, productId: number, isGift: boolean, giftMessage?: string): Promise<void>;
}

// Keep existing PostgreSQL implementation
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresStore({
      pool,
      tableName: 'session'
    });
  }

  // Products
  async getProducts(): Promise<Product[]> {
    throw new Error("Not implemented");
  }
  async getProduct(id: number): Promise<Product | undefined> {
    throw new Error("Not implemented");
  }
  async getProductsByCategory(category: string): Promise<Product[]> {
    throw new Error("Not implemented");
  }

  // Blog posts
  async getBlogPosts(): Promise<BlogPost[]> {
    throw new Error("Not implemented");
  }
  async getBlogPost(slug: string): Promise<BlogPost | undefined> {
    throw new Error("Not implemented");
  }

  // Contact messages
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    throw new Error("Not implemented");
  }

  // Cart methods
  async getCartItems(userId: string): Promise<CartItem[]> {
    throw new Error("Not implemented");
  }
  async addCartItem(item: InsertCartItem): Promise<CartItem> {
    throw new Error("Not implemented");
  }
  async updateCartItemQuantity(userId: string, productId: number, quantity: number): Promise<void> {
    throw new Error("Not implemented");
  }
  async removeCartItem(userId: string, productId: number): Promise<void> {
    throw new Error("Not implemented");
  }
  async clearCart(userId: string): Promise<void> {
    throw new Error("Not implemented");
  }

  // Order methods
  async createOrder(order: InsertOrder): Promise<Order> {
    throw new Error("Not implemented");
  }
  async getOrder(orderRef: string): Promise<Order | undefined> {
    throw new Error("Not implemented");
  }
  async getOrdersByUserId(userId: string): Promise<Order[]> {
    throw new Error("Not implemented");
  }
  async getOrderByRef(orderRef: string): Promise<Order | undefined> {
    throw new Error("Not implemented");
  }
  async updateOrderStatus(orderRef: string, status: string, method?: string): Promise<Order> {
    throw new Error("Not implemented");
  }
  async updateOrderTracking(orderRef: string, trackingStatus: string, estimatedDelivery?: string): Promise<Order> {
    throw new Error("Not implemented");
  }

  // Order Status History methods
  async addOrderStatusHistory(history: OrderStatusHistory): Promise<OrderStatusHistory> {
    throw new Error("Not implemented");
  }
  async getOrderStatusHistory(orderId: number): Promise<OrderStatusHistory[]> {
    throw new Error("Not implemented");
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    throw new Error("Not implemented");
  }
  async getUserByUsername(username: string): Promise<User | undefined> {
    throw new Error("Not implemented");
  }
  async createUser(user: InsertUser): Promise<User> {
    throw new Error("Not implemented");
  }

  // Gift orders
  async createGiftOrder(giftOrder: InsertGiftOrder): Promise<GiftOrder> {
    throw new Error("Not implemented");
  }
  async getGiftOrder(orderId: number): Promise<GiftOrder | undefined> {
    throw new Error("Not implemented");
  }
  async getGiftOrderByRedemptionCode(code: string): Promise<GiftOrder | undefined> {
    throw new Error("Not implemented");
  }
  async updateGiftOrderRedemptionStatus(orderId: number, isRedeemed: boolean): Promise<GiftOrder> {
    throw new Error("Not implemented");
  }
  async getGiftOrdersBySender(senderUserId: string): Promise<GiftOrder[]> {
    throw new Error("Not implemented");
  }

  async updateCartItemGiftStatus(
    userId: string,
    productId: number,
    isGift: boolean,
    giftMessage?: string
  ): Promise<void> {
    throw new Error("Not implemented");
  }
}


// New implementation that we'll gradually build up
export class ReplitDBStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // For now, still use PostgreSQL for sessions
    this.sessionStore = new PostgresStore({
      pool,
      tableName: 'session'
    });
  }

  // We'll implement these methods one by one
  async getProducts(): Promise<Product[]> {
    throw new Error("Not implemented");
  }
  async getProduct(id: number): Promise<Product | undefined> {
    throw new Error("Not implemented");
  }
  async getProductsByCategory(category: string): Promise<Product[]> {
    throw new Error("Not implemented");
  }

  // Blog posts
  async getBlogPosts(): Promise<BlogPost[]> {
    throw new Error("Not implemented");
  }
  async getBlogPost(slug: string): Promise<BlogPost | undefined> {
    throw new Error("Not implemented");
  }

  // Contact messages
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    throw new Error("Not implemented");
  }

  // Cart methods
  async getCartItems(userId: string): Promise<CartItem[]> {
    throw new Error("Not implemented");
  }
  async addCartItem(item: InsertCartItem): Promise<CartItem> {
    throw new Error("Not implemented");
  }
  async updateCartItemQuantity(userId: string, productId: number, quantity: number): Promise<void> {
    throw new Error("Not implemented");
  }
  async removeCartItem(userId: string, productId: number): Promise<void> {
    throw new Error("Not implemented");
  }
  async clearCart(userId: string): Promise<void> {
    throw new Error("Not implemented");
  }

  // Order methods
  async createOrder(order: InsertOrder): Promise<Order> {
    throw new Error("Not implemented");
  }
  async getOrder(orderRef: string): Promise<Order | undefined> {
    throw new Error("Not implemented");
  }
  async getOrdersByUserId(userId: string): Promise<Order[]> {
    throw new Error("Not implemented");
  }
  async getOrderByRef(orderRef: string): Promise<Order | undefined> {
    throw new Error("Not implemented");
  }
  async updateOrderStatus(orderRef: string, status: string, method?: string): Promise<Order> {
    throw new Error("Not implemented");
  }
  async updateOrderTracking(orderRef: string, trackingStatus: string, estimatedDelivery?: string): Promise<Order> {
    throw new Error("Not implemented");
  }

  // Order Status History methods
  async addOrderStatusHistory(history: OrderStatusHistory): Promise<OrderStatusHistory> {
    throw new Error("Not implemented");
  }
  async getOrderStatusHistory(orderId: number): Promise<OrderStatusHistory[]> {
    throw new Error("Not implemented");
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    throw new Error("Not implemented");
  }
  async getUserByUsername(username: string): Promise<User | undefined> {
    throw new Error("Not implemented");
  }
  async createUser(user: InsertUser): Promise<User> {
    throw new Error("Not implemented");
  }

  // Gift orders
  async createGiftOrder(giftOrder: InsertGiftOrder): Promise<GiftOrder> {
    throw new Error("Not implemented");
  }
  async getGiftOrder(orderId: number): Promise<GiftOrder | undefined> {
    throw new Error("Not implemented");
  }
  async getGiftOrderByRedemptionCode(code: string): Promise<GiftOrder | undefined> {
    throw new Error("Not implemented");
  }
  async updateGiftOrderRedemptionStatus(orderId: number, isRedeemed: boolean): Promise<GiftOrder> {
    throw new Error("Not implemented");
  }
  async getGiftOrdersBySender(senderUserId: string): Promise<GiftOrder[]> {
    throw new Error("Not implemented");
  }

  async updateCartItemGiftStatus(
    userId: string,
    productId: number,
    isGift: boolean,
    giftMessage?: string
  ): Promise<void> {
    throw new Error("Not implemented");
  }
}

// Export the PostgreSQL implementation for now
export const storage = new DatabaseStorage();