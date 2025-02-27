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
  type ReturnRequest,
} from "@shared/schema";
import Database from "@replit/database";
import session from "express-session";
import { type User, type InsertUser } from "@shared/schema";
import MemoryStore from "memorystore";

const MemoryStoreSession = MemoryStore(session);

// Initialize Replit Database client (Unused in the new implementation)
//const replitDb = new Database();

// Helper functions for key management (Unused in the new implementation)
//const keys = {
//  // User keys
//  user: (id: number) => `users:${id}`,
//  userByUsername: (username: string) => `users:username:${username}`,
//  userNextId: () => 'users:next_id',
//
//  // Product keys
//  product: (id: number) => `products:${id}`,
//  productsByCategory: (category: string) => `products:category:${category}`,
//  productNextId: () => 'products:next_id',
//  allProducts: () => 'products:all',
//
//  // Test key
//  test: () => "test_key",
//};

// Helper functions for generating sequential IDs (Unused in the new implementation)
//async function getNextId(type: 'users' | 'products'): Promise<number> { ... }

// Helper function to extract value from Replit DB response (Unused in the new implementation)
//function extractValue<T>(response: unknown): T | null { ... }

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

  // Return Request methods
  createReturnRequest(returnRequest: ReturnRequest): Promise<ReturnRequest>;
  getReturnRequests(orderRef: string): Promise<ReturnRequest[]>;

  // Session store
  sessionStore: session.Store;
}

export class ReplitDBStorage implements IStorage {
  private memStore: {
    products: Product[];
    users: Map<number, User>;
    orders: Map<string, Order>;
    cartItems: Map<string, CartItem[]>;
    returns: Map<string, ReturnRequest[]>;
  };

  sessionStore: session.Store;

  constructor() {
    this.memStore = {
      products: [],
      users: new Map(),
      orders: new Map(),
      cartItems: new Map(),
      returns: new Map()
    };

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

  // Product methods
  async getProducts(): Promise<Product[]> {
    return this.memStore.products;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.memStore.products.find(p => p.id === id);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return this.memStore.products.filter(p =>
      p.category.toLowerCase() === category.toLowerCase()
    );
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.memStore.products.length + 1;
    const newProduct: Product = {
      ...product,
      id
    };
    this.memStore.products.push(newProduct);
    return newProduct;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.memStore.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.memStore.users.values())
      .find(u => u.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.memStore.users.size + 1;
    const newUser: User = {
      ...user,
      id,
      createdAt: new Date(),
      firstName: user.firstName || null,
      lastName: user.lastName || null
    };
    this.memStore.users.set(id, newUser);
    return newUser;
  }

  // Cart methods
  async getCartItems(userId: string): Promise<CartItem[]> {
    return this.memStore.cartItems.get(userId) || [];
  }

  async addCartItem(item: InsertCartItem): Promise<CartItem> {
    const cartItems = this.memStore.cartItems.get(item.userId) || [];
    const newItem: CartItem = {
      ...item,
      id: cartItems.length + 1,
      isGift: item.isGift || false // Fix for isGift type error
    };
    cartItems.push(newItem);
    this.memStore.cartItems.set(item.userId, cartItems);
    return newItem;
  }

  async updateCartItemQuantity(userId: string, productId: number, quantity: number): Promise<void> {
    const cartItems = this.memStore.cartItems.get(userId) || [];
    const item = cartItems.find(i => i.productId === productId);
    if (item) {
      item.quantity = quantity;
      this.memStore.cartItems.set(userId, cartItems);
    }
  }

  async removeCartItem(userId: string, productId: number): Promise<void> {
    const cartItems = this.memStore.cartItems.get(userId) || [];
    const filtered = cartItems.filter(i => i.productId !== productId);
    this.memStore.cartItems.set(userId, filtered);
  }

  async clearCart(userId: string): Promise<void> {
    this.memStore.cartItems.delete(userId);
  }

  // Order methods
  async createOrder(order: InsertOrder): Promise<Order> {
    const orderRef = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const newOrder: Order = {
      id: this.memStore.orders.size + 1,
      orderRef,
      status: order.status,
      userId: order.userId,
      items: order.items,
      shipping: order.shipping,
      total: order.total || 0, // Fix for total type error
      method: order.method,
      createdAt: new Date(),
      lastUpdated: new Date(),
      trackingNumber: null,
      trackingStatus: null,
      estimatedDelivery: null
    };
    this.memStore.orders.set(orderRef, newOrder);
    return newOrder;
  }

  async getOrder(orderRef: string): Promise<Order | undefined> {
    return this.memStore.orders.get(orderRef);
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    return Array.from(this.memStore.orders.values())
      .filter(o => o.userId === userId);
  }

  async getOrderByRef(orderRef: string): Promise<Order | undefined> {
    return this.memStore.orders.get(orderRef);
  }

  async updateOrderStatus(orderRef: string, status: string, method?: string): Promise<Order> {
    const order = this.memStore.orders.get(orderRef);
    if (!order) throw new Error("Order not found");

    order.status = status as "pending" | "completed" | "failed";
    if (method) order.method = method;
    order.lastUpdated = new Date();

    this.memStore.orders.set(orderRef, order);
    return order;
  }

  // Return Request methods
  async createReturnRequest(returnRequest: ReturnRequest): Promise<ReturnRequest> {
    const returns = this.memStore.returns.get(returnRequest.orderRef) || [];
    returns.push(returnRequest);
    this.memStore.returns.set(returnRequest.orderRef, returns);
    return returnRequest;
  }

  async getReturnRequests(orderRef: string): Promise<ReturnRequest[]> {
    return this.memStore.returns.get(orderRef) || [];
  }

  // Other required interface methods with default implementations
  async getBlogPosts(): Promise<BlogPost[]> { return []; }
  async getBlogPost(_slug: string): Promise<BlogPost | undefined> { return undefined; }
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> { return { id: 0, ...message }; }
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

// Export an instance of the storage implementation
export const storage = new ReplitDBStorage();