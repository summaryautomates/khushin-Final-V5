import { pgTable, text, serial, integer, boolean, jsonb, foreignKey, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Add users table schema definition at the top
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  category: text("category").notNull(),
  images: text("images").array().notNull(),
  customizable: boolean("customizable").notNull().default(false),
  features: jsonb("features").notNull(),
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

export const returnRequests = pgTable("return_requests", {
  id: serial("id").primaryKey(),
  orderRef: text("order_ref").notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default('pending'),
  items: jsonb("items").$type<Array<{ productId: number; quantity: number; reason: string }>>().notNull(),
  additionalNotes: text("additional_notes"),
  createdAt: text("created_at").notNull(),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  giftWrapType: text("gift_wrap_type"),
  giftWrapCost: integer("gift_wrap_cost").default(0),
});

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  cartItems: many(cartItems),
}));

export const discountCodes = pgTable("discount_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  discountPercent: integer("discount_percent").notNull(),
  validUntil: text("valid_until").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderRef: text("order_ref").notNull().unique(),
  userId: text("user_id").notNull(),
  status: text("status").notNull().default('pending'),
  total: integer("total").notNull(),
  items: jsonb("items").$type<Array<{
    productId: number,
    quantity: number,
    price: number,
    name: string
  }>>().notNull(),
  shipping: jsonb("shipping").$type<{
    fullName: string,
    address: string,
    city: string,
    state: string,
    pincode: string,
    phone: string
  }>().notNull(),
  trackingNumber: text("tracking_number"),
  trackingStatus: text("tracking_status"),
  estimatedDelivery: text("estimated_delivery"),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderStatusHistory = pgTable("order_status_history", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  status: text("status").notNull(),
  location: text("location"),
  description: text("description").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const loyaltyPoints = pgTable("loyalty_points", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  points: integer("points").notNull().default(0),
  tier: text("tier").notNull().default('bronze'),
  lastUpdated: timestamp("last_updated").notNull().defaultNow()
});

export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: text("referrer_id").notNull(),
  referredId: text("referred_id").notNull(),
  status: text("status").notNull().default('pending'),
  pointsAwarded: boolean("points_awarded").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  pointsCost: integer("points_cost").notNull(),
  type: text("type").notNull(), // 'discount', 'product', 'experience'
  isActive: boolean("is_active").notNull().default(true),
  validUntil: timestamp("valid_until")
});

export const referralCodes = pgTable("referral_codes", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  code: text("code").notNull().unique(),
  timesUsed: integer("times_used").notNull().default(0),
  pointsEarned: integer("points_earned").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at")
});

export const referralHistory = pgTable("referral_history", {
  id: serial("id").primaryKey(),
  referralId: integer("referral_id").notNull().references(() => referrals.id),
  pointsAwarded: integer("points_awarded").notNull(),
  type: text("type").notNull(), // 'signup', 'purchase', etc.
  metadata: jsonb("metadata").$type<{
    orderId?: string;
    purchaseAmount?: number;
    bonusType?: string;
  }>(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Add relations
export const referralsRelations = relations(referrals, ({ one, many }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id]
  }),
  referred: one(users, {
    fields: [referrals.referredId],
    references: [users.id]
  }),
  history: many(referralHistory)
}));

// Add users table schema definition at the top
export const insertUserSchema = createInsertSchema(users)
  .omit({ 
    id: true,
    createdAt: true 
  })
  .extend({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    email: z.string().email("Invalid email address"),
    firstName: z.string().optional(),
    lastName: z.string().optional()
  });

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({ id: true });
export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({ id: true });
export const insertReturnRequestSchema = createInsertSchema(returnRequests).omit({ id: true });
export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true });
export const insertDiscountCodeSchema = createInsertSchema(discountCodes).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ 
  id: true,
  lastUpdated: true,
  createdAt: true 
}).extend({
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
  }),
  userId: z.string(),
  orderRef: z.string().optional(),
  status: z.enum(['pending', 'completed', 'failed']).optional().default('pending'),
  total: z.number().optional(),
  trackingNumber: z.string().optional(),
  trackingStatus: z.string().optional(),
  estimatedDelivery: z.string().optional()
});
export const insertOrderStatusHistorySchema = createInsertSchema(orderStatusHistory).omit({ 
  id: true,
  timestamp: true 
});
export const insertLoyaltySchema = createInsertSchema(loyaltyPoints).omit({ id: true, lastUpdated: true });
export const insertReferralSchema = createInsertSchema(referrals).omit({ id: true, createdAt: true });
export const insertRewardSchema = createInsertSchema(rewards).omit({ id: true });

// Add insert schemas
export const insertReferralCodeSchema = createInsertSchema(referralCodes).omit({ 
  id: true,
  timesUsed: true,
  pointsEarned: true,
  createdAt: true 
});

export const insertReferralHistorySchema = createInsertSchema(referralHistory).omit({ 
  id: true,
  createdAt: true 
});

export type Product = typeof products.$inferSelect;
export type BlogPost = typeof blogPosts.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type ReturnRequest = typeof returnRequests.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type InsertReturnRequest = z.infer<typeof insertReturnRequestSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type InsertDiscountCode = z.infer<typeof insertDiscountCodeSchema>;
export type Order = typeof orders.$inferSelect;
export type OrderStatusHistory = typeof orderStatusHistory.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertOrderStatusHistory = z.infer<typeof insertOrderStatusHistorySchema>;
export type LoyaltyPoints = typeof loyaltyPoints.$inferSelect;
export type Referral = typeof referrals.$inferSelect;
export type Reward = typeof rewards.$inferSelect;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Add types
export type ReferralCode = typeof referralCodes.$inferSelect;
export type ReferralHistory = typeof referralHistory.$inferSelect;
export type InsertReferralCode = z.infer<typeof insertReferralCodeSchema>;
export type InsertReferralHistory = z.infer<typeof insertReferralHistorySchema>;