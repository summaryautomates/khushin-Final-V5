/*
  # Initial Schema Setup

  1. New Tables
    - `products` - Stores product information
    - `orders` - Stores order information
    - `cart_items` - Stores shopping cart items
    - `users` - Stores user information

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
*/

-- Create products table if it doesn't exist
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  collection VARCHAR(100) DEFAULT 'standard',
  images TEXT[] DEFAULT '{}',
  features JSONB DEFAULT '{}',
  customizable BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  "orderRef" VARCHAR(255) NOT NULL UNIQUE,
  "userId" VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  total NUMERIC(10,2) NOT NULL,
  items TEXT NOT NULL,
  shipping TEXT NOT NULL,
  "paymentMethod" VARCHAR(50),
  "trackingNumber" VARCHAR(255),
  "trackingStatus" VARCHAR(100),
  "estimatedDelivery" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "lastUpdated" TIMESTAMPTZ DEFAULT now()
);

-- Create cart_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  "userId" VARCHAR(255) NOT NULL,
  "productId" INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  "isGift" BOOLEAN DEFAULT false,
  "giftMessage" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now(),
  UNIQUE ("userId", "productId"),
  FOREIGN KEY ("productId") REFERENCES products(id) ON DELETE CASCADE
);

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  is_guest BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create summary table for ecommerce analytics
CREATE TABLE IF NOT EXISTS "Summuryecom" (
  id BIGINT NOT NULL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Summuryecom" ENABLE ROW LEVEL SECURITY;

-- Create policies for products
CREATE POLICY "Anyone can read products" 
  ON products
  FOR SELECT 
  TO anon, authenticated
  USING (true);

CREATE POLICY "khushin_products_read_all" 
  ON products
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- Create policies for orders
CREATE POLICY "Users can create own orders" 
  ON orders
  FOR INSERT 
  TO authenticated
  WITH CHECK ((uid())::text = ("userId")::text);

CREATE POLICY "Users can read own orders" 
  ON orders
  FOR SELECT 
  TO authenticated
  USING ((uid())::text = ("userId")::text);

CREATE POLICY "Users can update own orders" 
  ON orders
  FOR UPDATE 
  TO authenticated
  USING ((uid())::text = ("userId")::text);

CREATE POLICY "khushin_orders_create_own" 
  ON orders
  FOR INSERT 
  TO authenticated
  WITH CHECK ((uid())::text = ("userId")::text);

CREATE POLICY "khushin_orders_read_own" 
  ON orders
  FOR SELECT 
  TO authenticated
  USING ((uid())::text = ("userId")::text);

CREATE POLICY "khushin_orders_update_own" 
  ON orders
  FOR UPDATE 
  TO authenticated
  USING ((uid())::text = ("userId")::text);

-- Create policies for cart_items
CREATE POLICY "Users can manage own cart" 
  ON cart_items
  FOR ALL 
  TO authenticated
  USING ((uid())::text = ("userId")::text)
  WITH CHECK ((uid())::text = ("userId")::text);

CREATE POLICY "khushin_cart_items_manage_own" 
  ON cart_items
  FOR ALL 
  TO authenticated
  USING ((uid())::text = ("userId")::text)
  WITH CHECK ((uid())::text = ("userId")::text);

-- Create policies for users
CREATE POLICY "Users can read own data" 
  ON users
  FOR SELECT 
  TO authenticated
  USING ((id)::text = (uid())::text);

CREATE POLICY "Users can update own data" 
  ON users
  FOR UPDATE 
  TO authenticated
  USING ((id)::text = (uid())::text);

CREATE POLICY "khushin_users_read_own" 
  ON users
  FOR SELECT 
  TO authenticated
  USING ((id)::text = (uid())::text);

CREATE POLICY "khushin_users_update_own" 
  ON users
  FOR UPDATE 
  TO authenticated
  USING ((id)::text = (uid())::text);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders("userId");
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items("userId");