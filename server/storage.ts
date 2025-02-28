import {
  type User,
  type InsertUser,
  type Order,
  type InsertOrder,
  users,
  products,
} from "@shared/schema";
import { eq } from "drizzle-orm";
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

      const [order] = await db.execute<Order>(sql`
        INSERT INTO orders (
          order_ref,
          user_id,
          status,
          total,
          items,
          shipping,
          created_at,
          last_updated
        ) VALUES (
          ${orderData.orderRef},
          ${orderData.userId},
          ${orderData.status},
          ${orderData.total},
          ${JSON.stringify(orderData.items)},
          ${JSON.stringify(orderData.shipping)},
          NOW(),
          NOW()
        ) RETURNING *
      `);

      console.log('Order created successfully:', {
        ref: order.orderRef,
        userId: order.userId
      });

      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getOrderByRef(orderRef: string): Promise<Order | undefined> {
    try {
      console.log('Fetching order by ref:', orderRef);
      const [order] = await db.execute<Order>(sql`
        SELECT * FROM orders WHERE order_ref = ${orderRef}
      `);
      return order;
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

      await db.execute(sql`
        UPDATE orders
        SET status = ${status},
            payment_method = ${paymentMethod},
            last_updated = NOW()
        WHERE order_ref = ${orderRef}
      `);

      console.log('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    try {
      console.log('Fetching orders for user:', userId);
      const orders = await db.execute<Order[]>(sql`
        SELECT * FROM orders
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      `);
      return orders;
    } catch (error) {
      console.error('Error fetching orders for user:', error);
      throw error;
    }
  }
}

export const storage = new ReplitDBStorage();