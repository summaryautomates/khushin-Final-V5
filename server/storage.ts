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
  type InsertOrderStatusHistory,
  products,
  blogPosts,
  contactMessages,
  cartItems,
  orders,
  orderStatusHistory,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { users, type User, type InsertUser } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

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
  addOrderStatusHistory(history: InsertOrderStatusHistory): Promise<OrderStatusHistory>;
  getOrderStatusHistory(orderId: number): Promise<OrderStatusHistory[]>;

  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === "production",
      },
      createTableIfMissing: true,
    });
  }

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    if (isNaN(id)) return undefined;
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.category, category));
  }

  async getBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts);
  }

  async getBlogPost(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post;
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [newMessage] = await db.insert(contactMessages).values(message).returning();
    return newMessage;
  }

  async getCartItems(userId: string): Promise<CartItem[]> {
    return await db
      .select({
        id: cartItems.id,
        userId: cartItems.userId,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        giftWrapType: cartItems.giftWrapType,
        giftWrapCost: cartItems.giftWrapCost,
        product: products
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId));
  }

  async addCartItem(item: InsertCartItem): Promise<CartItem> {
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, item.userId),
          eq(cartItems.productId, item.productId)
        )
      );

    if (existingItem) {
      const newQuantity = existingItem.quantity + item.quantity;
      if (newQuantity > 10) {
        throw new Error("Maximum quantity per item is 10");
      }

      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: newQuantity })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    }

    const [cartItem] = await db
      .insert(cartItems)
      .values(item)
      .returning();
    return cartItem;
  }

  async updateCartItemQuantity(userId: string, productId: number, quantity: number): Promise<void> {
    if (quantity === 0) {
      await this.removeCartItem(userId, productId);
      return;
    }

    if (quantity > 10) {
      throw new Error("Maximum quantity per item is 10");
    }

    await db
      .update(cartItems)
      .set({ quantity })
      .where(
        and(
          eq(cartItems.userId, userId),
          eq(cartItems.productId, productId)
        )
      );
  }

  async removeCartItem(userId: string, productId: number): Promise<void> {
    await db
      .delete(cartItems)
      .where(
        and(
          eq(cartItems.userId, userId),
          eq(cartItems.productId, productId)
        )
      );
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    try {
      // Validate and prepare order items
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

      // Calculate total from validated items
      const total = validatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Prepare the order data
      const orderData = {
        orderRef: order.orderRef || `ORD${Date.now()}`,
        userId: order.userId,
        status: order.status || 'pending',
        total: order.total || total,
        items: validatedItems,
        shipping: order.shipping,
        createdAt: new Date(),
        lastUpdated: new Date()
      };

      const [newOrder] = await db.insert(orders).values(orderData).returning();

      if (!newOrder) {
        throw new Error("Failed to create order");
      }

      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getOrder(orderRef: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.orderRef, orderRef));
    return order;
  }

  async getOrderByRef(orderRef: string): Promise<Order | undefined> {
    return this.getOrder(orderRef);
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async updateOrderStatus(orderRef: string, status: string, method?: string): Promise<Order> {
    const updates: Partial<Order> = {
      status,
      lastUpdated: new Date()
    };

    // Add tracking number based on payment method if provided
    if (method) {
      updates.trackingNumber = method === 'cod' ? `COD${Date.now()}` : undefined;
    }

    const [updatedOrder] = await db
      .update(orders)
      .set(updates)
      .where(eq(orders.orderRef, orderRef))
      .returning();

    if (!updatedOrder) {
      throw new Error(`Order not found: ${orderRef}`);
    }

    return updatedOrder;
  }

  async updateOrderTracking(
    orderRef: string,
    trackingStatus: string,
    estimatedDelivery?: string
  ): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({
        trackingStatus,
        estimatedDelivery,
        lastUpdated: new Date(),
      })
      .where(eq(orders.orderRef, orderRef))
      .returning();
    return updatedOrder;
  }

  async addOrderStatusHistory(history: InsertOrderStatusHistory): Promise<OrderStatusHistory> {
    const [newHistory] = await db.insert(orderStatusHistory).values(history).returning();
    return newHistory;
  }

  async getOrderStatusHistory(orderId: number): Promise<OrderStatusHistory[]> {
    return await db
      .select()
      .from(orderStatusHistory)
      .where(eq(orderStatusHistory.orderId, orderId))
      .orderBy(desc(orderStatusHistory.timestamp));
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
}

export const storage = new DatabaseStorage();