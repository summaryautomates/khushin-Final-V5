import {
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type Product,
} from "@shared/schema";
import Database from "@replit/database";
import session from "express-session";
import { type User } from "@shared/schema";
import MemoryStore from "memorystore";

const MemoryStoreSession = MemoryStore(session);
const replitDb = new Database();

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
  private db = replitDb;

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

  // Product methods
  async initializeProducts(products: Product[]): Promise<void> {
    try {
      console.log('Initializing products...');
      await this.db.set(keys.productList(), JSON.stringify(products));

      for (const product of products) {
        await this.db.set(keys.product(product.id), JSON.stringify(product));
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
      const productsStr = await this.db.get(keys.productList());
      if (!productsStr) {
        return [];
      }
      return JSON.parse(typeof productsStr === 'string' ? productsStr : JSON.stringify(productsStr));
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  async getProduct(id: number): Promise<Product | undefined> {
    try {
      console.log('Fetching product:', id);
      const productStr = await this.db.get(keys.product(id));
      if (!productStr) {
        return undefined;
      }
      return JSON.parse(typeof productStr === 'string' ? productStr : JSON.stringify(productStr));
    } catch (error) {
      console.error('Error fetching product:', error);
      return undefined;
    }
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      console.log('Fetching products by category:', category);
      const products = await this.getProducts();
      return products.filter(p => p.category.toLowerCase() === category.toLowerCase());
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

      await this.db.set(keys.order(orderId), JSON.stringify(newOrder));
      await this.db.set(keys.orderByRef(newOrder.orderRef), JSON.stringify(newOrder));

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

      const keys = await this.db.list('orders:');
      const orders: Order[] = [];

      for (const key of keys) {
        const orderStr = await this.db.get(key);
        if (orderStr) {
          try {
            const order = JSON.parse(typeof orderStr === 'string' ? orderStr : JSON.stringify(orderStr));
            if (order.userId?.toString() === userId) {
              orders.push(order);
            }
          } catch (parseError) {
            console.error('Error parsing order:', parseError);
          }
        }
      }

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
      const orderStr = await this.db.get(keys.orderByRef(orderRef));

      if (!orderStr) {
        console.log('Order not found:', orderRef);
        return undefined;
      }

      const order = JSON.parse(typeof orderStr === 'string' ? orderStr : JSON.stringify(orderStr));
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

      const order = await this.getOrderByRef(orderRef);
      if (!order) {
        throw new Error('Order not found');
      }

      const updatedOrder: Order = {
        ...order,
        status: status as 'pending' | 'completed' | 'failed',
        lastUpdated: new Date()
      };

      await this.db.set(keys.order(order.id), JSON.stringify(updatedOrder));
      await this.db.set(keys.orderByRef(orderRef), JSON.stringify(updatedOrder));

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
}

export const storage = new ReplitDBStorage();