import {
  type User,
  type InsertUser,
  users,
  products
} from "@shared/schema";
import pg from 'pg';
import session from "express-session";
import MemoryStore from "memorystore";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";

const { Pool } = pg;
const MemoryStoreSession = MemoryStore(session);

// Set up PostgreSQL connection using environment variables
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: parseInt(process.env.PGPORT || '5432'),
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize drizzle
const db = drizzle(pool);

// Test the database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Successfully connected to PostgreSQL database');
  }
});

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
}

export class ReplitDBStorage implements IStorage {
  sessionStore: session.Store;
  private pool = pool;
  private db = db;

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

      const result = await this.db.insert(users).values({
        username: userData.username,
        password: userData.password,
        email: userData.email,
        first_name: userData.first_name || null,
        last_name: userData.last_name || null
      }).returning();

      const user = result[0];
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
      const result = await this.db.select().from(users).where(eq(users.id, id));
      return result[0];
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      console.log('Fetching user by username:', username);
      const result = await this.db.select().from(users).where(eq(users.username, username));
      return result[0];
    } catch (error) {
      console.error('Error fetching user by username:', error);
      return undefined;
    }
  }

  // Product methods
  async getProducts(): Promise<typeof products.$inferSelect[]> {
    try {
      console.log('Fetching all products');
      const result = await this.db.select().from(products);
      return result;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async getProductById(id: number): Promise<typeof products.$inferSelect | undefined> {
    try {
      console.log('Fetching product by ID:', id);
      const result = await this.db.select().from(products).where(eq(products.id, id));
      return result[0];
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      return undefined;
    }
  }

  async getProductsByCategory(category: string): Promise<typeof products.$inferSelect[]> {
    try {
      console.log('Fetching products by category:', category);
      const result = await this.db.select().from(products).where(eq(products.category, category));
      return result;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  }
}

export const storage = new ReplitDBStorage();