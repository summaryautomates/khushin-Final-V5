import {
  type Product,
  type BlogPost,
  type ContactMessage,
  type InsertProduct,
  type InsertBlogPost,
  type InsertContactMessage,
} from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private products: Map<number, Product>;
  private blogPosts: Map<number, BlogPost>;
  private contactMessages: Map<number, ContactMessage>;
  private currentProductId: number;
  private currentBlogId: number;
  private currentMessageId: number;

  constructor() {
    this.products = new Map();
    this.blogPosts = new Map();
    this.contactMessages = new Map();
    this.currentProductId = 1;
    this.currentBlogId = 1;
    this.currentMessageId = 1;

    // Initialize with mock data
    this.initializeMockData();
  }

  private initializeMockData() {
    const mockProducts: InsertProduct[] = [
      {
        name: "Classic Silver Lighter",
        description: "Elegant silver-plated lighter with timeless design",
        price: 2999,
        category: "lighters",
        images: ["https://placehold.co/600x400?text=Classic+Silver+Lighter"],
        customizable: true,
        features: { material: "silver-plated", refillable: true }
      },
      // Add more mock products...
    ];

    const mockBlogPosts: InsertBlogPost[] = [
      {
        title: "The Art of Fire Starting",
        content: "Long-form content about fire starting techniques...",
        summary: "Discover the ancient techniques of fire starting",
        image: "https://placehold.co/800x400?text=Fire+Starting",
        slug: "art-of-fire-starting"
      },
      // Add more mock blog posts...
    ];

    mockProducts.forEach(product => {
      const id = this.currentProductId++;
      this.products.set(id, { ...product, id });
    });

    mockBlogPosts.forEach(post => {
      const id = this.currentBlogId++;
      this.blogPosts.set(id, { ...post, id });
    });
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      product => product.category === category
    );
  }

  async getBlogPosts(): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values());
  }

  async getBlogPost(slug: string): Promise<BlogPost | undefined> {
    return Array.from(this.blogPosts.values()).find(
      post => post.slug === slug
    );
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const id = this.currentMessageId++;
    const newMessage = { ...message, id };
    this.contactMessages.set(id, newMessage);
    return newMessage;
  }
}

export const storage = new MemStorage();
