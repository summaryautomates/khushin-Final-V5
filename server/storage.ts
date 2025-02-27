import {
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type Product,
} from "@shared/schema";
import pkg from 'pg';
const { Pool } = pkg;
import session from "express-session";
import { type User } from "@shared/schema";
import MemoryStore from "memorystore";

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

// Test the database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Successfully connected to PostgreSQL database');
  }
});

const keys = {
  order: (id: number) => `orders:${id}`,
  orderByRef: (ref: string) => `order:${ref}`,
  product: (id: number) => `products:${id}`,
  productList: () => 'products:list',
};

export interface IStorage {
  // Product methods
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  initializeProducts(products: Product[]): Promise<void>;

  // User methods
  createUser(user: any): Promise<User>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;

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

  // Session store
  sessionStore: session.Store;
}

export class ReplitDBStorage implements IStorage {
  sessionStore: session.Store;
  private pool = pool;

  constructor() {
    console.log('Initializing ReplitDBStorage...');
    this.sessionStore = new MemoryStoreSession({
      checkPeriod: 86400000,
      ttl: 24 * 60 * 60 * 1000,
      noDisposeOnSet: true,
      dispose: (sid: string) => {
        console.log('Session disposed:', { sid, timestamp: new Date().toISOString() });
      },
      stale: false,
      max: 1000
    });
    console.log('ReplitDBStorage initialized successfully');
  }

  // Product methods - Updated to use PostgreSQL
  async initializeProducts(products: Product[]): Promise<void> {
    try {
      console.log('Initializing products...');

      // Insert products into PostgreSQL
      for (const product of products) {
        await this.pool.query(`
          INSERT INTO products (name, description, price, category, images, customizable, features)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            price = EXCLUDED.price,
            category = EXCLUDED.category,
            images = EXCLUDED.images,
            customizable = EXCLUDED.customizable,
            features = EXCLUDED.features
        `, [
          product.name,
          product.description,
          product.price,
          product.category,
          product.images,
          product.customizable,
          product.features
        ]);
      }

      console.log('Products initialized successfully:', {
        count: products.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error initializing products:', error);
      throw error;
    }
  }

  async getProducts(): Promise<Product[]> {
    try {
      console.log('Fetching all products');
      const result = await this.pool.query('SELECT * FROM products');
      return result.rows;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  async getProduct(id: number): Promise<Product | undefined> {
    try {
      console.log('Fetching product:', id);
      const result = await this.pool.query('SELECT * FROM products WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching product:', error);
      return undefined;
    }
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      console.log('Fetching products by category:', category);
      const result = await this.pool.query('SELECT * FROM products WHERE category = $1', [category]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  }

  // Cart methods (stubbed for now as we focus on orders)
  async getCartItems(_userId: string): Promise<CartItem[]> { return []; }
  async addCartItem(item: InsertCartItem): Promise<CartItem> { return { id: 0, ...item }; }
  async updateCartItemQuantity(_userId: string, _productId: number, _quantity: number): Promise<void> {}
  async removeCartItem(_userId: string, _productId: number): Promise<void> {}
  async clearCart(_userId: string): Promise<void> {}

  // Order methods
  async createOrder(order: InsertOrder): Promise<Order> {
    try {
      console.log('Creating order:', { 
        userId: order.userId,
        itemCount: order.items.length,
        total: order.total 
      });

      const orderId = Date.now();
      const newOrder: Order = {
        id: orderId,
        orderRef: order.orderRef || `order-${orderId}`,
        userId: order.userId,
        items: order.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price || 0,
          name: item.name || 'Product'
        })),
        shipping: order.shipping,
        total: order.total,
        status: order.status,
        lastUpdated: new Date(),
        createdAt: new Date(),
        trackingNumber: null,
        trackingStatus: null,
        estimatedDelivery: null
      };

      await this.pool.query(
        `INSERT INTO orders (id, orderRef, userId, items, shipping, total, status, lastUpdated, createdAt) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [newOrder.id, newOrder.orderRef, newOrder.userId, JSON.stringify(newOrder.items), JSON.stringify(newOrder.shipping), newOrder.total, newOrder.status, newOrder.lastUpdated, newOrder.createdAt]
      );


      console.log('Order created successfully:', {
        id: newOrder.id,
        ref: newOrder.orderRef
      });

      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getOrder(orderRef: string): Promise<Order | undefined> {
    return this.getOrderByRef(orderRef);
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    try {
      console.log('Fetching orders for user:', userId);

      const result = await this.pool.query('SELECT * FROM orders WHERE userId = $1', [userId]);
      const orders = result.rows;

      console.log('Orders fetched successfully:', {
        userId,
        count: orders.length
      });

      return orders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error fetching orders for user:', error);
      return [];
    }
  }

  async getOrderByRef(orderRef: string): Promise<Order | undefined> {
    try {
      console.log('Fetching order by ref:', orderRef);
      const result = await this.pool.query('SELECT * FROM orders WHERE orderRef = $1', [orderRef]);
      const order = result.rows[0];

      if (!order) {
        console.log('Order not found:', orderRef);
        return undefined;
      }

      console.log('Order found:', { ref: orderRef, status: order.status });

      return order;
    } catch (error) {
      console.error('Error fetching order by ref:', error);
      return undefined;
    }
  }

  async updateOrderStatus(orderRef: string, status: string, method?: string): Promise<Order> {
    try {
      console.log('Updating order status:', { ref: orderRef, status, method });

      const result = await this.pool.query('SELECT * FROM orders WHERE orderRef = $1', [orderRef]);
      let order = result.rows[0];
      if (!order) {
        throw new Error('Order not found');
      }

      const updatedOrder: Order = {
        ...order,
        status: status as 'pending' | 'completed' | 'failed',
        lastUpdated: new Date()
      };

      await this.pool.query(
        `UPDATE orders SET status = $1, lastUpdated = $2 WHERE orderRef = $3`,
        [updatedOrder.status, updatedOrder.lastUpdated, orderRef]
      );

      console.log('Order status updated successfully:', {
        ref: orderRef,
        status,
        method
      });

      return updatedOrder;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // User methods implementation
  async createUser(userData: any): Promise<User> {
    try {
      console.log('Creating user:', { username: userData.username });

      const result = await this.pool.query(`
        INSERT INTO users (username, password, email, firstName, lastName)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [
        userData.username,
        userData.password,
        userData.email,
        userData.firstName,
        userData.lastName
      ]);

      const user = result.rows[0];
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
      const result = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      console.log('Fetching user by username:', username);
      const result = await this.pool.query('SELECT * FROM users WHERE username = $1', [username]);
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching user by username:', error);
      return undefined;
    }
  }
}

export const storage = new ReplitDBStorage();