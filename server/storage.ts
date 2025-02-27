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
  // User keys
  user: (id: number) => `users:${id}`,
  userByUsername: (username: string) => `users:username:${username}`,
  userNextId: () => 'users:next_id',

  // Product keys
  product: (id: number) => `products:${id}`,
  productsByCategory: (category: string) => `products:category:${category}`,
  productNextId: () => 'products:next_id',
  allProducts: () => 'products:all',

  // Test key
  test: () => "test_key",
};

// Helper functions for generating sequential IDs
async function getNextId(type: 'users' | 'products'): Promise<number> {
  try {
    const key = type === 'users' ? keys.userNextId() : keys.productNextId();
    const currentId = Number(await replitDb.get(key)) || 0;
    const nextId = currentId + 1;
    await replitDb.set(key, nextId);
    return nextId;
  } catch (error) {
    console.error(`Error generating next ${type} ID:`, error);
    throw error;
  }
}

// Helper function to extract value from Replit DB response
function extractValue<T>(response: unknown): T | null {
  if (response === null || response === undefined) {
    return null;
  }

  if (typeof response === 'object' && response !== null && 'value' in response) {
    return response.value as T;
  }

  return response as T;
}

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;

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

  // Gift orders
  createGiftOrder(giftOrder: InsertGiftOrder): Promise<GiftOrder>;
  getGiftOrder(orderId: number): Promise<GiftOrder | undefined>;
  getGiftOrderByRedemptionCode(code: string): Promise<GiftOrder | undefined>;
  updateGiftOrderRedemptionStatus(orderId: number, isRedeemed: boolean): Promise<GiftOrder>;
  getGiftOrdersBySender(senderUserId: string): Promise<GiftOrder[]>;
  updateCartItemGiftStatus(userId: string, productId: number, isGift: boolean, giftMessage?: string): Promise<void>;

  // Session store
  sessionStore: session.Store;
}

export class ReplitDBStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
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
  }

  // Product methods - Updated implementations
  async getProducts(): Promise<Product[]> {
    try {
      console.log('ReplitDB: Fetching all products');
      const response = await replitDb.get(keys.allProducts());
      const productsStr = extractValue<string>(response);

      if (!productsStr) {
        console.log('ReplitDB: No products found, initializing empty array');
        await replitDb.set(keys.allProducts(), JSON.stringify([]));
        return [];
      }

      try {
        const products = JSON.parse(productsStr);
        if (!Array.isArray(products)) {
          console.error('ReplitDB: Products data is not an array:', {
            type: typeof products,
            value: products,
            timestamp: new Date().toISOString()
          });
          await replitDb.set(keys.allProducts(), JSON.stringify([]));
          return [];
        }

        console.log('ReplitDB: Products fetched successfully:', {
          count: products.length,
          timestamp: new Date().toISOString()
        });
        return products;
      } catch (parseError) {
        console.error('ReplitDB: Error parsing products data:', {
          error: parseError instanceof Error ? parseError.message : 'Unknown error',
          data: productsStr,
          timestamp: new Date().toISOString()
        });
        await replitDb.set(keys.allProducts(), JSON.stringify([]));
        return [];
      }
    } catch (error) {
      console.error('ReplitDB: Error fetching products:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      return [];
    }
  }

  async getProduct(id: number): Promise<Product | undefined> {
    try {
      console.log('ReplitDB: Fetching product:', {
        id,
        timestamp: new Date().toISOString()
      });

      const response = await replitDb.get(keys.product(id));
      const productStr = extractValue<string>(response);

      if (!productStr) {
        console.log('ReplitDB: Product not found:', {
          id,
          timestamp: new Date().toISOString()
        });
        return undefined;
      }

      try {
        const product = JSON.parse(productStr);
        if (!product || typeof product !== 'object' || !('id' in product)) {
          console.error('ReplitDB: Invalid product data:', {
            id,
            data: product,
            timestamp: new Date().toISOString()
          });
          return undefined;
        }

        console.log('ReplitDB: Product found:', {
          id,
          name: product.name,
          timestamp: new Date().toISOString()
        });
        return product;
      } catch (parseError) {
        console.error('ReplitDB: Error parsing product data:', {
          id,
          error: parseError instanceof Error ? parseError.message : 'Unknown error',
          data: productStr,
          timestamp: new Date().toISOString()
        });
        return undefined;
      }
    } catch (error) {
      console.error('ReplitDB: Error fetching product:', {
        id,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      return undefined;
    }
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      console.log('ReplitDB: Fetching products by category:', { category });
      const products = await this.getProducts();
      const filteredProducts = products.filter(p =>
        p.category.toLowerCase() === category.toLowerCase()
      );
      console.log('ReplitDB: Products found in category:', {
        category,
        count: filteredProducts.length
      });
      return filteredProducts;
    } catch (error) {
      console.error('ReplitDB: Error fetching products by category:', {
        category,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      return [];
    }
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    try {
      console.log('ReplitDB: Creating new product');
      const id = await this.getNextId('products');

      const newProduct: Product = {
        ...product,
        id
      };

      const productStr = JSON.stringify(newProduct);
      await replitDb.set(keys.product(id), productStr);

      // Update the all products list
      const products = await this.getProducts();
      const existingIndex = products.findIndex(p => p.id === id);

      if (existingIndex !== -1) {
        products[existingIndex] = newProduct;
      } else {
        products.push(newProduct);
      }

      await replitDb.set(keys.allProducts(), JSON.stringify(products));

      console.log('ReplitDB: Product created successfully:', {
        id,
        name: product.name,
        timestamp: new Date().toISOString()
      });

      return newProduct;
    } catch (error) {
      console.error('ReplitDB: Error creating product:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  // User methods - Already implemented
  async getUser(id: number): Promise<User | undefined> {
    try {
      console.log('ReplitDB: Fetching user by ID:', { id });
      const response = await replitDb.get(keys.user(id));
      const userStr = extractValue<string>(response);

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
      const response = await replitDb.get(keys.userByUsername(username));

      if (!response) {
        console.log('ReplitDB: User not found:', { username });
        return undefined;
      }

      // Handle both string and object responses
      let userStr: string;
      if (typeof response === 'object' && response !== null && 'value' in response) {
        userStr = response.value as string;
      } else if (typeof response === 'string') {
        userStr = response;
      } else {
        console.error('ReplitDB: Invalid user data format:', {
          username,
          responseType: typeof response,
          timestamp: new Date().toISOString()
        });
        return undefined;
      }

      try {
        const user = JSON.parse(userStr);
        console.log('ReplitDB: User found:', { username });
        return user;
      } catch (parseError) {
        console.error('ReplitDB: Error parsing user data:', {
          username,
          error: parseError instanceof Error ? parseError.message : 'Unknown error',
          data: userStr,
          timestamp: new Date().toISOString()
        });
        return undefined;
      }
    } catch (error) {
      console.error('ReplitDB: Error fetching user by username:', {
        username,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      return undefined;
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

      const id = await getNextId('users');
      const newUser: User = {
        ...user,
        id,
        createdAt: new Date(),
        firstName: user.firstName || null,
        lastName: user.lastName || null
      };

      // Convert user object to string before storing
      const userStr = JSON.stringify(newUser);

      // Store user by both ID and username
      await replitDb.set(keys.user(id), userStr);
      await replitDb.set(keys.userByUsername(user.username), userStr);

      console.log('ReplitDB: User created successfully:', {
        id,
        username: user.username,
        timestamp: new Date().toISOString()
      });
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