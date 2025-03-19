import {
  type User,
  type InsertUser,
  type Order,
  type InsertOrder,
  users,
  products,
  orders
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";
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
      console.log('Creating order:', {
        userId: orderData.userId,
        itemCount: orderData.items.length,
        total: orderData.total
      });

      // Convert items to string before inserting
      const [order] = await db.insert(orders).values({
        orderRef: orderData.orderRef,
        userId: orderData.userId,
        status: orderData.status,
        total: orderData.total,
        items: JSON.stringify(orderData.items),
        shipping: JSON.stringify(orderData.shipping),
        createdAt: new Date(),
        lastUpdated: new Date()
      }).returning();

      // Parse items back to array when returning
      return {
        ...order,
        items: JSON.parse(order.items as string),
        shipping: JSON.parse(order.shipping as string)
      };
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

      // Parse items and shipping from string to object
      return {
        ...order,
        items: JSON.parse(order.items as string),
        shipping: JSON.parse(order.shipping as string)
      };
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

      // Parse items and shipping for each order
      return ordersList.map(order => ({
        ...order,
        items: JSON.parse(order.items as string),
        shipping: JSON.parse(order.shipping as string)
      }));
    } catch (error) {
      console.error('Error fetching orders for user:', error);
      throw error;
    }
  }
}

export const storage = new ReplitDBStorage();