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
import MemoryStore from "memorystore";
import { type User, type InsertUser } from "@shared/schema";

const MemoryStoreSession = MemoryStore(session);

// Initialize Replit Database client
const db = new Database();

// Helper functions for key management
const keys = {
  user: (id: number) => `users:${id}`,
  userByUsername: (username: string) => `users:username:${username}`,
  product: (id: number) => `products:${id}`,
  allProducts: () => "products:all",
  blogPost: (slug: string) => `blog_posts:${slug}`,
  allBlogPosts: () => "blog_posts:all",
  cartItem: (userId: string, productId: number) => `cart_items:${userId}:${productId}`,
  userCart: (userId: string) => `cart_items:${userId}`,
  order: (orderRef: string) => `orders:${orderRef}`,
  userOrders: (userId: string) => `orders:user:${userId}`,
  orderStatusHistory: (orderId: number) => `order_status_history:${orderId}`,
  giftOrder: (orderId: number) => `gift_orders:${orderId}`,
  giftOrderByCode: (code: string) => `gift_orders:code:${code}`,
  nextId: (type: string) => `${type}:next_id`,
};

// Helper function to generate sequential IDs
async function getNextId(type: string): Promise<number> {
  const key = keys.nextId(type);
  const currentId = await db.get(key) || 0;
  const nextId = currentId + 1;
  await db.set(key, nextId);
  return nextId;
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

  // Add new method for updating gift status
  updateCartItemGiftStatus(userId: string, productId: number, isGift: boolean, giftMessage?: string): Promise<void>;
}

export class ReplitDBStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }

  // Products
  async getProducts(): Promise<Product[]> {
    const productsStr = await db.get(keys.allProducts()) as string;
    return productsStr ? JSON.parse(productsStr) : [];
  }

  async getProduct(id: number): Promise<Product | undefined> {
    if (isNaN(id)) return undefined;
    const product = await db.get(keys.product(id)) as string;
    return product ? JSON.parse(product) : undefined;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    const products = await this.getProducts();
    return products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  // Blog posts
  async getBlogPosts(): Promise<BlogPost[]> {
    const postsStr = await db.get(keys.allBlogPosts()) as string;
    return postsStr ? JSON.parse(postsStr) : [];
  }

  async getBlogPost(slug: string): Promise<BlogPost | undefined> {
    const post = await db.get(keys.blogPost(slug)) as string;
    return post ? JSON.parse(post) : undefined;
  }

  // Contact messages
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const id = await getNextId('contact_messages');
    const newMessage = { ...message, id };
    await db.set(`contact_messages:${id}`, JSON.stringify(newMessage));
    return newMessage;
  }

  // Cart methods
  async getCartItems(userId: string): Promise<CartItem[]> {
    const cartStr = await db.get(keys.userCart(userId)) as string;
    const cartItems = cartStr ? JSON.parse(cartStr) : [];

    // Fetch associated products
    const itemsWithProducts = await Promise.all(
      cartItems.map(async (item: CartItem) => {
        const product = await this.getProduct(item.productId);
        return { ...item, product };
      })
    );

    return itemsWithProducts;
  }

  async addCartItem(item: InsertCartItem): Promise<CartItem> {
    const existingItems = await this.getCartItems(item.userId);
    const existingItem = existingItems.find(i => i.productId === item.productId);

    if (existingItem) {
      const newQuantity = existingItem.quantity + item.quantity;
      if (newQuantity > 10) {
        throw new Error("Maximum quantity per item is 10");
      }

      const updatedItem = { ...existingItem, quantity: newQuantity };
      const updatedItems = existingItems.map(i =>
        i.productId === item.productId ? updatedItem : i
      );

      await db.set(keys.userCart(item.userId), JSON.stringify(updatedItems));
      return updatedItem;
    }

    const id = await getNextId('cart_items');
    const newItem = { ...item, id };
    const updatedItems = [...existingItems, newItem];
    await db.set(keys.userCart(item.userId), JSON.stringify(updatedItems));
    return newItem;
  }

  async updateCartItemQuantity(userId: string, productId: number, quantity: number): Promise<void> {
    if (quantity === 0) {
      await this.removeCartItem(userId, productId);
      return;
    }

    if (quantity > 10) {
      throw new Error("Maximum quantity per item is 10");
    }

    const items = await this.getCartItems(userId);
    const updatedItems = items.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    );

    await db.set(keys.userCart(userId), JSON.stringify(updatedItems));
  }

  async removeCartItem(userId: string, productId: number): Promise<void> {
    const items = await this.getCartItems(userId);
    const filteredItems = items.filter(item => item.productId !== productId);
    await db.set(keys.userCart(userId), JSON.stringify(filteredItems));
  }

  async clearCart(userId: string): Promise<void> {
    await db.set(keys.userCart(userId), JSON.stringify([]));
  }

  // Orders
  async createOrder(order: InsertOrder): Promise<Order> {
    try {
      const validatedItems = await Promise.all(
        order.items.map(async (item) => {
          const product = await this.getProduct(item.productId);
          if (!product) {
            throw new Error(`Product not found: ${item.productId}`);
          }
          return {
            productId: item.productId,
            quantity: item.quantity,
            price: product.price,
            name: product.name
          };
        })
      );

      const total = validatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const orderRef = order.orderRef || `ORD${Date.now()}`;

      const orderData = {
        orderRef,
        userId: order.userId,
        status: order.status || 'pending',
        total: order.total || total,
        items: validatedItems,
        shipping: order.shipping,
        createdAt: new Date(),
        lastUpdated: new Date()
      };

      await db.set(keys.order(orderRef), JSON.stringify(orderData));

      // Update user orders index
      const userOrdersKey = keys.userOrders(order.userId);
      const userOrders = await db.get(userOrdersKey) as string[];
      await db.set(userOrdersKey, [...(userOrders || []), orderRef]);

      return orderData;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getOrder(orderRef: string): Promise<Order | undefined> {
    const orderStr = await db.get(keys.order(orderRef)) as string;
    return orderStr ? JSON.parse(orderStr) : undefined;
  }

  async getOrderByRef(orderRef: string): Promise<Order | undefined> {
    return this.getOrder(orderRef);
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    const userOrdersKey = keys.userOrders(userId);
    const orderRefs = await db.get(userOrdersKey) as string[];

    if (!orderRefs) return [];

    const orders = await Promise.all(
      orderRefs.map(ref => this.getOrder(ref))
    );

    return orders
      .filter((order): order is Order => order !== undefined)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateOrderStatus(orderRef: string, status: string, method?: string): Promise<Order> {
    const order = await this.getOrder(orderRef);
    if (!order) {
      throw new Error(`Order not found: ${orderRef}`);
    }

    const updates = {
      ...order,
      status,
      lastUpdated: new Date(),
      trackingNumber: method === 'cod' ? `COD${Date.now()}` : order.trackingNumber
    };

    await db.set(keys.order(orderRef), JSON.stringify(updates));
    return updates;
  }

  async updateOrderTracking(
    orderRef: string,
    trackingStatus: string,
    estimatedDelivery?: string
  ): Promise<Order> {
    const order = await this.getOrder(orderRef);
    if (!order) {
      throw new Error(`Order not found: ${orderRef}`);
    }

    const updates = {
      ...order,
      trackingStatus,
      estimatedDelivery,
      lastUpdated: new Date()
    };

    await db.set(keys.order(orderRef), JSON.stringify(updates));
    return updates;
  }

  // Order status history
  async addOrderStatusHistory(history: InsertOrderStatusHistory): Promise<OrderStatusHistory> {
    const id = await getNextId('order_status_history');
    const newHistory = {
      ...history,
      id,
      timestamp: new Date()
    };

    const key = keys.orderStatusHistory(history.orderId);
    const existingHistory = await db.get(key) as OrderStatusHistory[];
    const updatedHistory = [...(existingHistory || []), newHistory];

    await db.set(key, JSON.stringify(updatedHistory));
    return newHistory;
  }

  async getOrderStatusHistory(orderId: number): Promise<OrderStatusHistory[]> {
    const historyStr = await db.get(keys.orderStatusHistory(orderId)) as string;
    const history = historyStr ? JSON.parse(historyStr) : [];
    return history.sort((a: OrderStatusHistory, b: OrderStatusHistory) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const userStr = await db.get(keys.user(id)) as string;
    return userStr ? JSON.parse(userStr) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const userStr = await db.get(keys.userByUsername(username)) as string;
    return userStr ? JSON.parse(userStr) : undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = await getNextId('users');
    const newUser = {
      ...user,
      id,
      createdAt: new Date()
    };

    await db.set(keys.user(id), JSON.stringify(newUser));
    await db.set(keys.userByUsername(user.username), JSON.stringify(newUser));
    return newUser;
  }

  // Gift orders
  async createGiftOrder(giftOrder: InsertGiftOrder): Promise<GiftOrder> {
    const redemptionCode = giftOrder.redemptionCode ||
      `GIFT${Date.now()}${Math.random().toString(36).substring(2, 7)}`;

    const newGiftOrder = {
      ...giftOrder,
      redemptionCode,
      isRedeemed: false,
      createdAt: new Date()
    };

    await db.set(keys.giftOrder(giftOrder.orderId), JSON.stringify(newGiftOrder));
    await db.set(keys.giftOrderByCode(redemptionCode), JSON.stringify(newGiftOrder));
    return newGiftOrder;
  }

  async getGiftOrder(orderId: number): Promise<GiftOrder | undefined> {
    const giftOrderStr = await db.get(keys.giftOrder(orderId)) as string;
    return giftOrderStr ? JSON.parse(giftOrderStr) : undefined;
  }

  async getGiftOrderByRedemptionCode(code: string): Promise<GiftOrder | undefined> {
    const giftOrderStr = await db.get(keys.giftOrderByCode(code)) as string;
    return giftOrderStr ? JSON.parse(giftOrderStr) : undefined;
  }

  async updateGiftOrderRedemptionStatus(orderId: number, isRedeemed: boolean): Promise<GiftOrder> {
    const giftOrder = await this.getGiftOrder(orderId);
    if (!giftOrder) {
      throw new Error(`Gift order not found: ${orderId}`);
    }

    const updatedGiftOrder = { ...giftOrder, isRedeemed };
    await db.set(keys.giftOrder(orderId), JSON.stringify(updatedGiftOrder));
    await db.set(keys.giftOrderByCode(giftOrder.redemptionCode), JSON.stringify(updatedGiftOrder));
    return updatedGiftOrder;
  }

  async getGiftOrdersBySender(senderUserId: string): Promise<GiftOrder[]> {
    // For Replit DB, we'll need to list all gift orders and filter
    const list = await db.list(`gift_orders:`);
    const giftOrders = await Promise.all(
      list.map(async (key) => {
        const orderStr = await db.get(key) as string;
        return JSON.parse(orderStr);
      })
    );

    return giftOrders
      .filter((order: GiftOrder) => order.senderUserId === senderUserId)
      .sort((a: GiftOrder, b: GiftOrder) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  async updateCartItemGiftStatus(
    userId: string,
    productId: number,
    isGift: boolean,
    giftMessage?: string
  ): Promise<void> {
    try {
      const items = await this.getCartItems(userId);
      const updatedItems = items.map(item =>
        item.productId === productId
          ? { ...item, isGift, giftMessage: giftMessage || null }
          : item
      );

      await db.set(keys.userCart(userId), JSON.stringify(updatedItems));
    } catch (error) {
      console.error('Error updating cart item gift status:', error);
      throw new Error('Failed to update gift status');
    }
  }
}

export const storage = new ReplitDBStorage();