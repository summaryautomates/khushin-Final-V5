import { pgTable, serial, text, varchar, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { z } from "zod";
import { createInsertSchema } from 'drizzle-zod';

// User table definition
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  first_name: varchar('first_name', { length: 255 }),
  last_name: varchar('last_name', { length: 255 }),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Products table definition
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: integer('price').notNull(),
  category: text('category').notNull(),
  collection: text('collection').notNull().default('standard'),
  images: text('images').array().notNull(),
  customizable: boolean('customizable').notNull().default(false),
  features: jsonb('features').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Orders table definition
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderRef: varchar('order_ref', { length: 255 }).notNull().unique(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  total: integer('total').notNull(),
  items: jsonb('items').notNull(),
  shipping: jsonb('shipping').notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }),
  trackingNumber: varchar('tracking_number', { length: 255 }),
  trackingStatus: varchar('tracking_status', { length: 50 }),
  estimatedDelivery: timestamp('estimated_delivery'),
  lastUpdated: timestamp('last_updated').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// Cart items table definition
export const cartItems = pgTable('cart_items', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  productId: integer('product_id').notNull(),
  quantity: integer('quantity').notNull().default(1),
  isGift: boolean('is_gift').notNull().default(false),
  giftMessage: text('gift_message'),
  giftWrapType: varchar('gift_wrap_type', { length: 50 }),
  giftWrapCost: integer('gift_wrap_cost'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Type definitions for User
export interface User {
  id: number;
  username: string;
  password: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  created_at: Date;
}

// Type definitions for Product
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  collection: string;
  images: string[];
  customizable: boolean;
  features: Record<string, any>;
}

// Type definitions for BlogPost
export interface BlogPost {
  id: number;
  title: string;
  content: string;
  summary: string;
  image: string;
  slug: string;
}

// Type definitions for ContactMessage
export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
}

// Type definitions for ReturnRequest
export interface ReturnRequest {
  id: number;
  orderRef: string;
  reason: string;
  status: string;
  items: Array<{ productId: number; quantity: number; reason: string }>;
  additionalNotes: string | null;
  createdAt: string;
}

// Type definitions for CartItem
export interface CartItem {
  id: number;
  userId: string;
  productId: number;
  quantity: number;
  isGift: boolean;
  giftMessage: string | null;
  giftWrapType: string | null;
  giftWrapCost: number | null;
}

// Type definitions for DiscountCode
export interface DiscountCode {
  id: number;
  code: string;
  discountPercent: number;
  validUntil: string;
  isActive: boolean;
}

// Type definitions for Order
export interface Order {
  id: number;
  orderRef: string;
  userId: string;
  status: string;
  total: number;
  items: Array<{
    productId: number;
    quantity: number;
    price: number;
    name: string;
  }>;
  shipping: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  trackingNumber: string | null;
  trackingStatus: string | null;
  estimatedDelivery: string | null;
  lastUpdated: Date;
  createdAt: Date;
}

// Type definitions for OrderStatusHistory
export interface OrderStatusHistory {
  id: number;
  orderId: number;
  status: string;
  location: string | null;
  description: string;
  timestamp: Date;
}

// Type definitions for LoyaltyPoints
export interface LoyaltyPoints {
  id: number;
  userId: string;
  points: number;
  tier: string;
  lastUpdated: Date;
}

// Type definitions for Referral
export interface Referral {
  id: number;
  referrerId: string;
  referredId: string;
  status: string;
  pointsAwarded: boolean;
  createdAt: Date;
}

// Type definitions for Reward
export interface Reward {
  id: number;
  name: string;
  description: string;
  pointsCost: number;
  type: string;
  isActive: boolean;
  validUntil: Date | null;
}

// Type definitions for GiftOrder
export interface GiftOrder {
  id: number;
  orderId: number;
  recipientEmail: string;
  recipientName: string;
  redemptionCode: string;
  isRedeemed: boolean;
  createdAt: Date;
}

// Zod schemas for validation
export const insertUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  email: z.string().email("Invalid email address"),
  first_name: z.string().nullable(),
  last_name: z.string().nullable()
});

export const insertProductSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number(),
  category: z.string(),
  collection: z.string().default('standard'),
  images: z.array(z.string()),
  customizable: z.boolean(),
  features: z.record(z.any())
});

export const insertBlogPostSchema = z.object({
  title: z.string(),
  content: z.string(),
  summary: z.string(),
  image: z.string(),
  slug: z.string()
});

export const insertContactMessageSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  message: z.string()
});

export const insertReturnRequestSchema = z.object({
  orderRef: z.string(),
  reason: z.string(),
  status: z.string(),
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number(),
    reason: z.string()
  })),
  additionalNotes: z.string().optional()
});

export const insertCartItemSchema = z.object({
  userId: z.string(),
  productId: z.number(),
  quantity: z.number(),
  isGift: z.boolean().optional(),
  giftMessage: z.string().optional(),
  giftWrapType: z.string().optional(),
  giftWrapCost: z.number().optional()
});

export const insertOrderSchema = z.object({
  userId: z.string(),
  orderRef: z.string().optional(),
  status: z.enum(['pending', 'completed', 'failed']).optional().default('pending'),
  total: z.number().optional(),
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    price: z.number().optional(),
    name: z.string().optional()
  })).min(1, "At least one item is required"),
  shipping: z.object({
    fullName: z.string().min(2, "Full name is required"),
    address: z.string().min(5, "Complete address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    pincode: z.string().regex(/^\d{6}$/, "Please enter a valid 6-digit pincode"),
    phone: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit phone number")
  })
});

export const insertGiftOrderSchema = z.object({
  orderId: z.number(),
  recipientEmail: z.string().email("Invalid recipient email address"),
  recipientName: z.string().min(2, "Recipient name is required"),
  redemptionCode: z.string().optional()
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type InsertReturnRequest = z.infer<typeof insertReturnRequestSchema>;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertGiftOrder = z.infer<typeof insertGiftOrderSchema>;