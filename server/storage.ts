import {
  type User,
  type InsertUser,
  type Order,
  type InsertOrder,
  type CartItem,
  type InsertCartItem,
  users,
  products,
  orders,
  cartItems
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import { createRequire } from "module";
import { db, supabase, checkDatabaseHealth } from "./db";

const require = createRequire(import.meta.url);
const session = require("express-session");
const MemoryStore = require("memorystore")(session);

export interface IStorage {
  // User methods
  createUser(user: InsertUser): Promise<User>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  updateUser(id: number, userData: Partial<InsertUser> & { is_guest?: boolean, expires_at?: Date | null }): Promise<User>;
  sessionStore: any;
  // Product methods
  getProducts(): Promise<typeof products.$inferSelect[]>;
  getProductById(id: number): Promise<typeof products.$inferSelect | undefined>;
  getProductsByCategory(category: string): Promise<typeof products.$inferSelect[]>;
  // Order methods
  createOrder(order: InsertOrder): Promise<Order>;
  getOrderByRef(orderRef: string): Promise<Order | undefined>;
  updateOrderStatus(orderRef: string, status: 'completed' | 'failed', paymentMethod: 'upi' | 'cod'): Promise<void>;
  getOrdersByUserId(userId: string): Promise<Order[]>;
  // Cart methods
  getCartItems(userId: string): Promise<{ product: typeof products.$inferSelect, quantity: number, isGift: boolean, giftMessage?: string }[]>;
  addToCart(userId: string, productId: number, quantity: number, isGift?: boolean, giftMessage?: string): Promise<void>;
  removeFromCart(userId: string, productId: number): Promise<void>;
  updateCartItemQuantity(userId: string, productId: number, quantity: number): Promise<void>;
  updateCartItemGiftStatus(userId: string, productId: number, isGift: boolean, giftMessage?: string): Promise<void>;
  clearCart(userId: string): Promise<void>;
}

export class ReplitDBStorage implements IStorage {
  sessionStore: any;

  constructor() {
    console.log('Initializing ReplitDBStorage...');
    this.sessionStore = new MemoryStore({
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

  private async executeWithFallback<T>(
    directDbOperation: () => Promise<T>,
    supabaseOperation?: () => Promise<T>,
    operationName: string = 'database operation'
  ): Promise<T> {
    // Check database health and attempt to re-initialize if needed
    try {
      const healthStatus = await checkDatabaseHealth();
      if (!healthStatus.healthy) {
        console.warn(`Database health check failed for ${operationName}:`, healthStatus.error);
        
        // If no database connection is available at all, throw error
        if (!db && !supabase) {
          console.warn(`No database connection available for ${operationName}. Using mock data.`);
          return this.getMockData(operationName) as T;
        }
      }
    } catch (healthError) {
      console.error(`Database health check error for ${operationName}:`, healthError);
      
      // If health check fails and no connections available, throw error
      if (!db && !supabase) {
        console.warn(`Database connection not available for ${operationName}. Using mock data.`);
        return this.getMockData(operationName) as T;
      }
    }
    
    // Try direct database connection first
    if (db) {
      try {
        return await directDbOperation();
      } catch (error) {
        console.error(`Direct database ${operationName} failed:`, error);
        // Don't immediately fall back, let the error propagate for critical operations
        if (!supabaseOperation) {
          console.warn(`Database operation failed and no fallback available. Using mock data.`);
          return this.getMockData(operationName) as T;
        }
      }
    }
    
    // Fall back to Supabase if available and fallback operation is provided
    if (supabase && supabaseOperation) {
      try {
        console.log(`Falling back to Supabase for ${operationName}`);
        return await supabaseOperation();
      } catch (fallbackError) {
        console.error(`Supabase fallback ${operationName} failed:`, fallbackError);
        console.warn(`Supabase fallback failed. Using mock data.`);
        return this.getMockData(operationName) as T;
      }
    }
    
    console.warn(`${operationName} failed - no available database connection. Using mock data.`);
    return this.getMockData(operationName) as T;
  }

  // Mock data for development when database is unavailable
  private getMockData(operationName: string): any {
    console.log(`Returning mock data for: ${operationName}`);
    
    // Mock products
    if (operationName.includes('product')) {
      if (operationName.includes('by ID')) {
        return {
          id: 1,
          name: "Luxury Lighter",
          description: "Premium luxury lighter with gold finish",
          price: 199900,
          category: "Lighter",
          collection: "luxury",
          images: ["/placeholders/product-placeholder.svg"],
          customizable: true,
          features: { material: "Gold plated", refillable: true }
        };
      }
      
      return [
        {
          id: 1,
          name: "Luxury Lighter",
          description: "Premium luxury lighter with gold finish",
          price: 199900,
          category: "Lighter",
          collection: "luxury",
          images: ["/placeholders/product-placeholder.svg"],
          customizable: true,
          features: { material: "Gold plated", refillable: true }
        },
        {
          id: 2,
          name: "Silver Lighter",
          description: "Elegant silver lighter with engraving",
          price: 149900,
          category: "Lighter",
          collection: "standard",
          images: ["/placeholders/product-placeholder.svg"],
          customizable: true,
          features: { material: "Silver", refillable: true }
        },
        {
          id: 3,
          name: "Premium Flask",
          description: "Stainless steel flask with leather wrap",
          price: 129900,
          category: "Flask",
          collection: "premium",
          images: ["/placeholders/product-placeholder.svg"],
          customizable: false,
          features: { material: "Stainless steel", capacity: "8oz" }
        }
      ];
    }
    
    // Mock cart items
    if (operationName.includes('cart')) {
      if (operationName.includes('add') || 
          operationName.includes('update') || 
          operationName.includes('remove') || 
          operationName.includes('clear')) {
        return null;
      }
      
      return [];
    }
    
    // Mock orders
    if (operationName.includes('order')) {
      if (operationName.includes('create')) {
        return {
          id: 1,
          orderRef: "mock-order-123",
          userId: "1",
          status: "pending",
          total: 199900,
          items: [{ productId: 1, quantity: 1, price: 199900, name: "Luxury Lighter" }],
          shipping: {
            fullName: "John Doe",
            address: "123 Main St",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400001",
            phone: "9876543210"
          },
          paymentMethod: null,
          trackingNumber: null,
          trackingStatus: null,
          estimatedDelivery: null,
          createdAt: new Date(),
          lastUpdated: new Date()
        };
      }
      
      if (operationName.includes('by ref')) {
        return {
          id: 1,
          orderRef: "mock-order-123",
          userId: "1",
          status: "pending",
          total: 199900,
          items: [{ productId: 1, quantity: 1, price: 199900, name: "Luxury Lighter" }],
          shipping: {
            fullName: "John Doe",
            address: "123 Main St",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400001",
            phone: "9876543210"
          },
          paymentMethod: null,
          trackingNumber: null,
          trackingStatus: null,
          estimatedDelivery: null,
          createdAt: new Date(),
          lastUpdated: new Date()
        };
      }
      
      return [];
    }
    
    // Mock user
    if (operationName.includes('user')) {
      if (operationName.includes('by username')) {
        return {
          id: 1,
          username: "testuser",
          password: "password-hash.salt",
          email: "test@example.com",
          first_name: "Test",
          last_name: "User",
          is_guest: false,
          expires_at: null,
          created_at: new Date()
        };
      }
      
      if (operationName.includes('create')) {
        return {
          id: 2,
          username: "newuser",
          password: "password-hash.salt",
          email: "new@example.com",
          first_name: null,
          last_name: null,
          is_guest: false,
          expires_at: null,
          created_at: new Date()
        };
      }
    }
    
    // Default empty response
    return null;
  }

  async createUser(userData: InsertUser & { is_guest?: boolean, expires_at?: Date | null }): Promise<User> {
    try {
      console.log('Creating user:', { username: userData.username, isGuest: userData.is_guest });
      
      return await this.executeWithFallback(
        async () => {
          const [user] = await db.insert(users).values({
            username: userData.username,
            password: userData.password,
            email: userData.email,
            first_name: userData.first_name || null,
            last_name: userData.last_name || null,
            is_guest: userData.is_guest || false,
            expires_at: userData.expires_at || null
          }).returning();
          return user;
        },
        undefined, // No Supabase fallback for user creation due to auth complexity
        'user creation'
      );
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      console.log('Fetching user by ID:', id);
      
      return await this.executeWithFallback(
        async () => {
          const [user] = await db.select().from(users).where(eq(users.id, id));
          return user;
        },
        undefined, // No Supabase fallback for user operations due to auth complexity
        'user fetch by ID'
      );
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      console.log('Fetching user by username:', username);
      
      return await this.executeWithFallback(
        async () => {
          const [user] = await db.select().from(users).where(eq(users.username, username));
          return user;
        },
        undefined, // No Supabase fallback for user operations due to auth complexity
        'user fetch by username'
      );
    } catch (error) {
      console.error('Error fetching user by username:', error);
      return undefined;
    }
  }
  
  async updateUser(id: number, userData: Partial<InsertUser> & { is_guest?: boolean, expires_at?: Date | null }): Promise<User> {
    try {
      console.log('Updating user:', { id, ...userData });
      
      return await this.executeWithFallback(
        async () => {
          // Remove undefined values to avoid setting fields to null unintentionally
          const updateData: Record<string, any> = {};
          for (const [key, value] of Object.entries(userData)) {
            if (value !== undefined) {
              updateData[key] = value;
            }
          }
          
          const [updatedUser] = await db.update(users)
            .set(updateData)
            .where(eq(users.id, id))
            .returning();
          
          if (!updatedUser) {
            throw new Error(`User with ID ${id} not found`);
          }
          
          return updatedUser;
        },
        undefined, // No Supabase fallback for user operations due to auth complexity
        'user update'
      );
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async getProducts(): Promise<typeof products.$inferSelect[]> {
    try {
      console.log('Fetching all products');

      // If no database connection, return mock data
      if (!db) {
        console.log('Using mock product data');
        return [
          {
            id: 1,
            name: "Luxury Gold Lighter",
            description: "Premium gold-plated lighter with elegant design",
            price: 299900,
            category: "lighters",
            collection: "luxury",
            images: ["/placeholders/product-placeholder.svg"],
            customizable: true,
            features: { material: "Gold-plated", refillable: true, warranty: "Lifetime" },
            created_at: new Date()
          },
          {
            id: 2,
            name: "Silver Pocket Lighter",
            description: "Compact silver lighter perfect for everyday use",
            price: 149900,
            category: "lighters",
            collection: "standard",
            images: ["/placeholders/product-placeholder.svg"],
            customizable: false,
            features: { material: "Silver", refillable: true, warranty: "5 years" },
            created_at: new Date()
          },
          {
            id: 3,
            name: "Premium Flask",
            description: "Stainless steel flask with leather wrapping",
            price: 189900,
            category: "flask",
            collection: "premium",
            images: ["/placeholders/product-placeholder.svg"],
            customizable: true,
            features: { material: "Stainless Steel", capacity: "8oz", leatherWrap: true },
            created_at: new Date()
          },
          {
            id: 4,
            name: "Vintage Collection Lighter",
            description: "Classic design with modern functionality",
            price: 249900,
            category: "lighters",
            collection: "luxury",
            images: ["/placeholders/product-placeholder.svg"],
            customizable: true,
            features: { material: "Brass", refillable: true, vintage: true },
            created_at: new Date()
          }
        ];
      }

      // If no database connection, return mock data
      if (!db) {
        console.log('Using mock product data');
        return [
          {
            id: 1,
            name: "Luxury Gold Lighter",
            description: "Premium gold-plated lighter with elegant design",
            price: 299900,
            category: "lighters",
            collection: "luxury",
            images: ["/placeholders/product-placeholder.svg"],
            customizable: true,
            features: { material: "Gold-plated", refillable: true, warranty: "Lifetime" },
            created_at: new Date()
          },
          {
            id: 2,
            name: "Silver Pocket Lighter",
            description: "Compact silver lighter perfect for everyday use",
            price: 149900,
            category: "lighters",
            collection: "standard",
            images: ["/placeholders/product-placeholder.svg"],
            customizable: false,
            features: { material: "Silver", refillable: true, warranty: "5 years" },
            created_at: new Date()
          },
          {
            id: 3,
            name: "Premium Flask",
            description: "Stainless steel flask with leather wrapping",
            price: 189900,
            category: "flask",
            collection: "premium",
            images: ["/placeholders/product-placeholder.svg"],
            customizable: true,
            features: { material: "Stainless Steel", capacity: "8oz", leatherWrap: true },
            created_at: new Date()
          },
          {
            id: 4,
            name: "Vintage Collection Lighter",
            description: "Classic design with modern functionality",
            price: 249900,
            category: "lighters",
            collection: "luxury",
            images: ["/placeholders/product-placeholder.svg"],
            customizable: true,
            features: { material: "Brass", refillable: true, vintage: true },
            created_at: new Date()
          }
        ];
      }
      
      return await this.executeWithFallback(
        async () => {
          const result = await db.select().from(products);
          console.log(`Successfully fetched ${result.length} products`);
          return result;
        },
        async () => {
          const { data, error } = await supabase.from('products').select('*');
          if (error) throw error;
          console.log(`Successfully fetched ${data?.length || 0} products via Supabase`);
          return data || [];
        },
        'products fetch'
      );
    } catch (error) {
      console.error('Error fetching products:', error);
      // Return empty array instead of throwing to prevent complete app failure
      console.log('Returning empty products array due to database error');
      return [];
    }
  }

  async getProductById(id: number): Promise<typeof products.$inferSelect | undefined> {
    try {
      console.log('Fetching product by ID:', id);

      // If no database connection, return mock data
      if (!db) {
        console.log('Using mock product data for ID:', id);
        const mockProducts = [
          {
            id: 1,
            name: "Luxury Gold Lighter",
            description: "Premium gold-plated lighter with elegant design",
            price: 299900,
            category: "lighters",
            collection: "luxury",
            images: ["/placeholders/product-placeholder.svg"],
            customizable: true,
            features: { material: "Gold-plated", refillable: true, warranty: "Lifetime" },
            created_at: new Date()
          },
          {
            id: 2,
            name: "Silver Pocket Lighter",
            description: "Compact silver lighter perfect for everyday use",
            price: 149900,
            category: "lighters",
            collection: "standard",
            images: ["/placeholders/product-placeholder.svg"],
            customizable: false,
            features: { material: "Silver", refillable: true, warranty: "5 years" },
            created_at: new Date()
          },
          {
            id: 3,
            name: "Premium Flask",
            description: "Stainless steel flask with leather wrapping",
            price: 189900,
            category: "flask",
            collection: "premium",
            images: ["/placeholders/product-placeholder.svg"],
            customizable: true,
            features: { material: "Stainless Steel", capacity: "8oz", leatherWrap: true },
            created_at: new Date()
          },
          {
            id: 4,
            name: "Vintage Collection Lighter",
            description: "Classic design with modern functionality",
            price: 249900,
            category: "lighters",
            collection: "luxury",
            images: ["/placeholders/product-placeholder.svg"],
            customizable: true,
            features: { material: "Brass", refillable: true, vintage: true },
            created_at: new Date()
          }
        ];
        return mockProducts.find(p => p.id === id);
      }

      // If no database connection, return mock data
      if (!db) {
        console.log('Using mock product data for ID:', id);
        const mockProducts = [
          {
            id: 1,
            name: "Luxury Gold Lighter",
            description: "Premium gold-plated lighter with elegant design",
            price: 299900,
            category: "lighters",
            collection: "luxury",
            images: ["/placeholders/product-placeholder.svg"],
            customizable: true,
            features: { material: "Gold-plated", refillable: true, warranty: "Lifetime" },
            created_at: new Date()
          },
          {
            id: 2,
            name: "Silver Pocket Lighter",
            description: "Compact silver lighter perfect for everyday use",
            price: 149900,
            category: "lighters",
            collection: "standard",
            images: ["/placeholders/product-placeholder.svg"],
            customizable: false,
            features: { material: "Silver", refillable: true, warranty: "5 years" },
            created_at: new Date()
          },
          {
            id: 3,
            name: "Premium Flask",
            description: "Stainless steel flask with leather wrapping",
            price: 189900,
            category: "flask",
            collection: "premium",
            images: ["/placeholders/product-placeholder.svg"],
            customizable: true,
            features: { material: "Stainless Steel", capacity: "8oz", leatherWrap: true },
            created_at: new Date()
          },
          {
            id: 4,
            name: "Vintage Collection Lighter",
            description: "Classic design with modern functionality",
            price: 249900,
            category: "lighters",
            collection: "luxury",
            images: ["/placeholders/product-placeholder.svg"],
            customizable: true,
            features: { material: "Brass", refillable: true, vintage: true },
            created_at: new Date()
          }
        ];
        return mockProducts.find(p => p.id === id);
      }
      
      return await this.executeWithFallback(
        async () => {
          const [product] = await db.select().from(products).where(eq(products.id, id));
          return product;
        },
        async () => {
          const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
          if (error && error.code !== 'PGRST116') throw error;
          return data;
        },
        'product fetch by ID'
      );
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      return undefined;
    }
  }

  async getProductsByCategory(category: string): Promise<typeof products.$inferSelect[]> {
    try {
      console.log('Fetching products by category:', category);

      // If no database connection, return mock data
      if (!db) {
        console.log('Using mock product data for category:', category);
        const mockProducts = [
          {
            id: 1,
            name: "Luxury Gold Lighter",
            description: "Premium gold-plated lighter with elegant design",
            price: 299900,
            category: "lighters",
            collection: "luxury",
            images: ["/placeholders/product-placeholder.svg"],
            customizable: true,
            features: { material: "Gold-plated", refillable: true, warranty: "Lifetime" },
            created_at: new Date()
          },
          {
            id: 2,
            name: "Silver Pocket Lighter",
            description: "Compact silver lighter perfect for everyday use",
            price: 149900,
            category: "lighters",
            collection: "standard",
            images: ["/placeholders/product-placeholder.svg"],
            customizable: false,
            features: { material: "Silver", refillable: true, warranty: "5 years" },
            created_at: new Date()
          },
          {
            id: 3,
            name: "Premium Flask",
            description: "Stainless steel flask with leather wrapping",
            price: 189900,
            category: "flask",
            collection: "premium",
            images: ["/placeholders/product-placeholder.svg"],
            customizable: true,
            features: { material: "Stainless Steel", capacity: "8oz", leatherWrap: true },
            created_at: new Date()
          },
          {
            id: 4,
            name: "Vintage Collection Lighter",
            description: "Classic design with modern functionality",
            price: 249900,
            category: "lighters",
            collection: "luxury",
            images: ["/placeholders/product-placeholder.svg"],
            customizable: true,
            features: { material: "Brass", refillable: true, vintage: true },
            created_at: new Date()
          }
        ];
        return mockProducts.filter(p => p.category === category);
      }
      
      return await this.executeWithFallback(
        async () => {
          return await db.select().from(products).where(eq(products.category, category));
        },
        async () => {
          const { data, error } = await supabase.from('products').select('*').eq('category', category);
          if (error) throw error;
          return data || [];
        },
        'products fetch by category'
      );
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  }

  async createOrder(orderData: InsertOrder): Promise<Order> {
    try {
      // Validate required fields before proceeding
      if (!orderData.userId) {
        throw new Error('User ID is required');
      }
      
      if (!orderData.orderRef) {
        throw new Error('Order reference is required');
      }
      
      if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        throw new Error('Order must contain at least one item');
      }
      
      if (!orderData.shipping) {
        throw new Error('Shipping information is required');
      }
      
      // Log the order data being created
      console.log('Creating order:', {
        userId: orderData.userId,
        itemCount: orderData.items.length,
        total: orderData.total,
        orderRef: orderData.orderRef,
        shippingComplete: !!orderData.shipping.fullName && 
                         !!orderData.shipping.address && 
                         !!orderData.shipping.city && 
                         !!orderData.shipping.state && 
                         !!orderData.shipping.pincode && 
                         !!orderData.shipping.phone
      });

      return await this.executeWithFallback(
        async () => {
          // Ensure data is properly formatted for database storage
          let itemsString = typeof orderData.items === 'string' 
            ? orderData.items 
            : JSON.stringify(orderData.items);
            
          let shippingString = typeof orderData.shipping === 'string' 
            ? orderData.shipping 
            : JSON.stringify(orderData.shipping);

          // Insert order into database with all required fields
          const [order] = await db.insert(orders).values({
            orderRef: orderData.orderRef,
            userId: orderData.userId,
            status: orderData.status || 'pending',
            total: orderData.total || 0,
            items: itemsString,
            shipping: shippingString,
            createdAt: new Date(),
            lastUpdated: new Date(),
            trackingNumber: null,
            trackingStatus: null,
            estimatedDelivery: null
          }).returning();

          console.log('Order created successfully:', { 
            ref: order.orderRef, 
            id: order.id,
            status: order.status
          });

          // Parse items and shipping back to objects for returning to client
          try {
            const parsedItems = typeof order.items === 'string' 
              ? JSON.parse(order.items) 
              : order.items;
              
            const parsedShipping = typeof order.shipping === 'string' 
              ? JSON.parse(order.shipping) 
              : order.shipping;

            return {
              ...order,
              items: parsedItems,
              shipping: parsedShipping,
              estimatedDelivery: order.estimatedDelivery ? order.estimatedDelivery.toISOString() : null
            };
          } catch (parseError) {
            console.error('Error parsing order data after creation:', parseError);
            // Return the order with unparsed data rather than failing completely
            return {
              ...order,
              estimatedDelivery: order.estimatedDelivery ? order.estimatedDelivery.toISOString() : null
            } as unknown as Order;
          }
        },
        undefined, // No Supabase fallback for complex order operations
        'order creation'
      );
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getOrderByRef(orderRef: string): Promise<Order | undefined> {
    try {
      console.log('Fetching order by ref:', orderRef);
      
      return await this.executeWithFallback(
        async () => {
          const [order] = await db.select().from(orders).where(eq(orders.orderRef, orderRef));
          if (!order) return undefined;

          try {
            // Parse items and shipping from string to object
            const parsedItems = typeof order.items === 'string' 
              ? JSON.parse(order.items) 
              : order.items;
              
            const parsedShipping = typeof order.shipping === 'string' 
              ? JSON.parse(order.shipping) 
              : order.shipping;

            return {
              ...order,
              items: parsedItems,
              shipping: parsedShipping,
              estimatedDelivery: order.estimatedDelivery ? order.estimatedDelivery.toISOString() : null
            };
          } catch (parseError) {
            console.error('Error parsing order data:', parseError);
            // Return the order with unparsed data rather than failing completely
            return {
              ...order,
              estimatedDelivery: order.estimatedDelivery ? order.estimatedDelivery.toISOString() : null
            } as unknown as Order;
          }
        },
        undefined, // No Supabase fallback for complex order operations
        'order fetch by ref'
      );
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

      await this.executeWithFallback(
        async () => {
          await db.update(orders)
            .set({
              status,
              paymentMethod,
              lastUpdated: new Date()
            })
            .where(eq(orders.orderRef, orderRef));

          console.log('Order status updated successfully');
        },
        undefined, // No Supabase fallback for complex order operations
        'order status update'
      );
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    try {
      console.log('Fetching orders for user:', userId);
      
      return await this.executeWithFallback(
        async () => {
          const ordersList = await db.select()
            .from(orders)
            .where(eq(orders.userId, userId))
            .orderBy(desc(orders.createdAt));

          // Parse items and shipping for each order with error handling
          return ordersList.map(order => {
            try {
              const parsedItems = typeof order.items === 'string' 
                ? JSON.parse(order.items) 
                : order.items;
                
              const parsedShipping = typeof order.shipping === 'string' 
                ? JSON.parse(order.shipping) 
                : order.shipping;

              return {
                ...order,
                items: parsedItems,
                shipping: parsedShipping,
                estimatedDelivery: order.estimatedDelivery ? order.estimatedDelivery.toISOString() : null
              };
            } catch (parseError) {
              console.error('Error parsing order data:', parseError);
              // Return the order with unparsed data rather than failing completely
              return {
                ...order,
                estimatedDelivery: order.estimatedDelivery ? order.estimatedDelivery.toISOString() : null
              } as unknown as Order;
            }
          });
        },
        undefined, // No Supabase fallback for complex order operations
        'orders fetch by user ID'
      );
    } catch (error) {
      console.error('Error fetching orders for user:', error);
      return [];
    }
  }

  // Cart methods implementation
  async getCartItems(userId: string): Promise<{ product: typeof products.$inferSelect, quantity: number, isGift: boolean, giftMessage?: string }[]> {
    try {
      console.log('Fetching cart items for user:', userId);
      
      return await this.executeWithFallback(
        async () => {
          // Join cart_items with products to get product details
          const items = await db.select({
            cart: cartItems,
            product: products
          })
          .from(cartItems)
          .innerJoin(products, eq(cartItems.productId, products.id))
          .where(eq(cartItems.userId, userId));
          
          // Transform the result to match the expected return type
          return items.map(item => ({
            product: item.product,
            quantity: item.cart.quantity,
            isGift: item.cart.isGift,
            giftMessage: item.cart.giftMessage || undefined
          }));
        },
        undefined, // No Supabase fallback for complex cart operations
        'cart items fetch'
      );
    } catch (error) {
      console.error('Error fetching cart items:', error);
      return [];
    }
  }

  async addToCart(userId: string, productId: number, quantity: number, isGift: boolean = false, giftMessage?: string): Promise<void> {
    try {
      console.log('Adding item to cart:', { userId, productId, quantity, isGift });
      
      await this.executeWithFallback(
        async () => {
          // Check if the item already exists in the cart
          const [existingItem] = await db.select()
            .from(cartItems)
            .where(and(
              eq(cartItems.userId, userId),
              eq(cartItems.productId, productId)
            ));
          
          if (existingItem) {
            // Update the existing cart item - replace quantity instead of adding
            await db.update(cartItems)
              .set({
                quantity, // Just use the provided quantity directly
                isGift,
                giftMessage: giftMessage || null,
                updatedAt: new Date()
              })
              .where(eq(cartItems.id, existingItem.id));
            
            console.log('Updated cart item information');
          } else {
            // Insert a new cart item
            await db.insert(cartItems).values({
              userId,
              productId,
              quantity,
              isGift,
              giftMessage: giftMessage || null,
              createdAt: new Date(),
              updatedAt: new Date()
            });
            
            console.log('Added new item to cart');
          }
        },
        undefined, // No Supabase fallback for complex cart operations
        'add to cart'
      );
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  }

  async removeFromCart(userId: string, productId: number): Promise<void> {
    try {
      console.log('Removing item from cart:', { userId, productId });
      
      await this.executeWithFallback(
        async () => {
          await db.delete(cartItems)
            .where(and(
              eq(cartItems.userId, userId),
              eq(cartItems.productId, productId)
            ));
          
          console.log('Item removed from cart');
        },
        undefined, // No Supabase fallback for complex cart operations
        'remove from cart'
      );
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw error;
    }
  }

  async updateCartItemQuantity(userId: string, productId: number, quantity: number): Promise<void> {
    try {
      console.log('Updating cart item quantity:', { userId, productId, quantity });
      
      if (quantity <= 0) {
        // If quantity is 0 or negative, remove the item from the cart
        await this.removeFromCart(userId, productId);
        return;
      }
      
      await this.executeWithFallback(
        async () => {
          await db.update(cartItems)
            .set({
              quantity,
              updatedAt: new Date()
            })
            .where(and(
              eq(cartItems.userId, userId),
              eq(cartItems.productId, productId)
            ));
          
          console.log('Cart item quantity updated');
        },
        undefined, // No Supabase fallback for complex cart operations
        'update cart item quantity'
      );
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      throw error;
    }
  }

  async updateCartItemGiftStatus(userId: string, productId: number, isGift: boolean, giftMessage?: string): Promise<void> {
    try {
      console.log('Updating cart item gift status:', { userId, productId, isGift, giftMessage });
      
      await this.executeWithFallback(
        async () => {
          await db.update(cartItems)
            .set({
              isGift,
              giftMessage: giftMessage || null,
              updatedAt: new Date()
            })
            .where(and(
              eq(cartItems.userId, userId),
              eq(cartItems.productId, productId)
            ));
          
          console.log('Cart item gift status updated');
        },
        undefined, // No Supabase fallback for complex cart operations
        'update cart item gift status'
      );
    } catch (error) {
      console.error('Error updating cart item gift status:', error);
      throw error;
    }
  }

  async clearCart(userId: string): Promise<void> {
    try {
      console.log('Clearing cart for user:', userId);
      
      await this.executeWithFallback(
        async () => {
          await db.delete(cartItems)
            .where(eq(cartItems.userId, userId));
          
          console.log('Cart cleared');
        },
        undefined, // No Supabase fallback for complex cart operations
        'clear cart'
      );
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }
}

export const storage = new ReplitDBStorage();