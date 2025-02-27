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
  type User,
  type InsertUser
} from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";

const MemoryStoreSession = MemoryStore(session);

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;

  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

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

class InMemoryStorage implements IStorage {
  private products: Product[] = [];
  private users: Map<number, User> = new Map();
  private orders: Map<string, Order> = new Map();
  private cartItems: Map<string, CartItem[]> = new Map();
  private returns: Map<string, ReturnRequest[]> = new Map();
  private giftOrders: Map<number, GiftOrder> = new Map();
  private orderHistory: Map<number, OrderStatusHistory[]> = new Map();

  sessionStore: session.Store;

  constructor() {
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
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return this.products;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.find(p => p.id === id);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return this.products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.products.length + 1;
    const newProduct = { ...product, id };
    this.products.push(newProduct);
    return newProduct;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.users.size + 1;
    const newUser: User = {
      ...user,
      id,
      createdAt: new Date(),
      firstName: user.firstName || null,
      lastName: user.lastName || null
    };
    this.users.set(id, newUser);
    return newUser;
  }

  // Cart methods
  async getCartItems(userId: string): Promise<CartItem[]> {
    return this.cartItems.get(userId) || [];
  }

  async addCartItem(item: InsertCartItem): Promise<CartItem> {
    const cartItems = this.cartItems.get(item.userId) || [];
    const newItem: CartItem = {
      ...item,
      id: cartItems.length + 1,
      isGift: item.isGift || false,
      giftMessage: item.giftMessage || null,
      giftWrapType: item.giftWrapType || null,
      giftWrapCost: item.giftWrapCost || null
    };
    cartItems.push(newItem);
    this.cartItems.set(item.userId, cartItems);
    return newItem;
  }

  async updateCartItemQuantity(userId: string, productId: number, quantity: number): Promise<void> {
    const cartItems = this.cartItems.get(userId) || [];
    const item = cartItems.find(i => i.productId === productId);
    if (item) {
      item.quantity = quantity;
      this.cartItems.set(userId, cartItems);
    }
  }

  async removeCartItem(userId: string, productId: number): Promise<void> {
    const cartItems = this.cartItems.get(userId) || [];
    const filtered = cartItems.filter(i => i.productId !== productId);
    this.cartItems.set(userId, filtered);
  }

  async clearCart(userId: string): Promise<void> {
    this.cartItems.delete(userId);
  }

  // Order methods
  async createOrder(order: InsertOrder): Promise<Order> {
    const orderRef = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const newOrder: Order = {
      id: this.orders.size + 1,
      orderRef,
      status: order.status,
      userId: order.userId,
      items: order.items.map(item => ({
        ...item,
        price: item.price || 0,
        name: item.name || 'Unknown Product'
      })),
      shipping: order.shipping,
      total: order.total || 0,
      createdAt: new Date(),
      lastUpdated: new Date(),
      trackingNumber: null,
      trackingStatus: null,
      estimatedDelivery: null
    };
    this.orders.set(orderRef, newOrder);
    return newOrder;
  }

  async getOrder(orderRef: string): Promise<Order | undefined> {
    return this.orders.get(orderRef);
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(o => o.userId === userId);
  }

  async getOrderByRef(orderRef: string): Promise<Order | undefined> {
    return this.orders.get(orderRef);
  }

  async updateOrderStatus(orderRef: string, status: string): Promise<Order> {
    const order = this.orders.get(orderRef);
    if (!order) throw new Error("Order not found");

    order.status = status as "pending" | "completed" | "failed";
    order.lastUpdated = new Date();
    this.orders.set(orderRef, order);
    return order;
  }

  async updateOrderTracking(orderRef: string, trackingStatus: string, estimatedDelivery?: string): Promise<Order> {
    const order = this.orders.get(orderRef);
    if (!order) throw new Error("Order not found");

    order.trackingStatus = trackingStatus;
    if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;
    order.lastUpdated = new Date();
    this.orders.set(orderRef, order);
    return order;
  }

  // Return Request methods
  async createReturnRequest(returnRequest: ReturnRequest): Promise<ReturnRequest> {
    const returns = this.returns.get(returnRequest.orderRef) || [];
    returns.push(returnRequest);
    this.returns.set(returnRequest.orderRef, returns);
    return returnRequest;
  }

  async getReturnRequests(orderRef: string): Promise<ReturnRequest[]> {
    return this.returns.get(orderRef) || [];
  }

  // Status History methods
  async addOrderStatusHistory(history: OrderStatusHistory): Promise<OrderStatusHistory> {
    const histories = this.orderHistory.get(history.orderId) || [];
    histories.push(history);
    this.orderHistory.set(history.orderId, histories);
    return history;
  }

  async getOrderStatusHistory(orderId: number): Promise<OrderStatusHistory[]> {
    return this.orderHistory.get(orderId) || [];
  }

  // Gift Order methods
  async createGiftOrder(giftOrder: InsertGiftOrder): Promise<GiftOrder> {
    const id = this.giftOrders.size + 1;
    const newGiftOrder: GiftOrder = {
      ...giftOrder,
      id,
      isRedeemed: false,
      createdAt: new Date()
    };
    this.giftOrders.set(id, newGiftOrder);
    return newGiftOrder;
  }

  async getGiftOrder(orderId: number): Promise<GiftOrder | undefined> {
    return this.giftOrders.get(orderId);
  }

  async getGiftOrderByRedemptionCode(code: string): Promise<GiftOrder | undefined> {
    return Array.from(this.giftOrders.values()).find(g => g.redemptionCode === code);
  }

  async updateGiftOrderRedemptionStatus(orderId: number, isRedeemed: boolean): Promise<GiftOrder> {
    const giftOrder = this.giftOrders.get(orderId);
    if (!giftOrder) throw new Error("Gift order not found");

    giftOrder.isRedeemed = isRedeemed;
    this.giftOrders.set(orderId, giftOrder);
    return giftOrder;
  }

  async getGiftOrdersBySender(senderUserId: string): Promise<GiftOrder[]> {
    return Array.from(this.giftOrders.values()).filter(g => g.senderUserId === senderUserId);
  }

  async updateCartItemGiftStatus(userId: string, productId: number, isGift: boolean, giftMessage?: string): Promise<void> {
    const cartItems = this.cartItems.get(userId) || [];
    const item = cartItems.find(i => i.productId === productId);
    if (item) {
      item.isGift = isGift;
      item.giftMessage = giftMessage || null;
      this.cartItems.set(userId, cartItems);
    }
  }

  // Placeholder implementations for remaining methods
  async getBlogPosts(): Promise<BlogPost[]> { return []; }
  async getBlogPost(_slug: string): Promise<BlogPost | undefined> { return undefined; }
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> { 
    return { id: 0, ...message }; 
  }
}

// Export an instance of the storage implementation
export const storage = new InMemoryStorage();