import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  category: text("category").notNull(),
  images: text("images").array().notNull(),
  customizable: boolean("customizable").notNull().default(false),
  features: jsonb("features").notNull(),
  variants: jsonb("variants").notNull(), // Added variants field
  reviews: jsonb("reviews").notNull(),   // Added reviews field
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  summary: text("summary").notNull(),
  image: text("image").notNull(),
  slug: text("slug").notNull().unique(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({ id: true });
export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({ id: true });

// Updated type definitions to reflect schema changes.  Zod schemas would need similar updates.
export type Product = typeof products.$inferSelect;
export type BlogPost = typeof blogPosts.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export const discountCodes = pgTable("discount_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  discountPercent: integer("discount_percent").notNull(),
  validUntil: text("valid_until").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertDiscountCodeSchema = createInsertSchema(discountCodes).omit({ id: true });
export type InsertDiscountCode = z.infer<typeof insertDiscountCodeSchema>;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;

export interface ProductVariant {
  id: string;
  color?: string;
  size?: string;
  price: number;
  stock: number;
}

export interface ProductReview {
  id: string;
  rating: number;
  comment: string;
  userName: string;
  date: string;
}

export interface ProductFeature {
  title: string;
  description: string;
  icon?: string;
}

//This interface is now largely redundant as the type Product is derived from the database schema
//export interface Product {
//  id: string;
//  name: string;
//  description: string;
//  price: number;
//  images: string[];
//  features: ProductFeature[];
//  variants: ProductVariant[];
//  reviews: ProductReview[];
//  averageRating?: number;
//}