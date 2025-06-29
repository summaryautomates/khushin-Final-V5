/*
  # Initial Database Schema Setup

  1. New Tables
    - `users` - User accounts with authentication support
    - `products` - Product catalog with images and pricing
    - `orders` - Order management with tracking
    - `cart_items` - Shopping cart functionality

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure data access patterns

  3. Sample Data
    - Insert sample products for testing
    - Ensure application has data to work with
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  is_guest BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  collection VARCHAR(100) DEFAULT 'standard',
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  "orderRef" VARCHAR(255) UNIQUE NOT NULL,
  "userId" VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  total DECIMAL(10,2) NOT NULL,
  items TEXT NOT NULL,
  shipping TEXT NOT NULL,
  "paymentMethod" VARCHAR(50),
  "trackingNumber" VARCHAR(255),
  "trackingStatus" VARCHAR(100),
  "estimatedDelivery" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "lastUpdated" TIMESTAMPTZ DEFAULT now()
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  "userId" VARCHAR(255) NOT NULL,
  "productId" INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  "isGift" BOOLEAN DEFAULT false,
  "giftMessage" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now(),
  UNIQUE("userId", "productId")
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Create policies for products table (public read access)
CREATE POLICY "Anyone can read products"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create policies for orders table
CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = "userId");

CREATE POLICY "Users can create own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = "userId");

-- Create policies for cart_items table
CREATE POLICY "Users can manage own cart"
  ON cart_items
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

-- Insert sample products
INSERT INTO products (name, description, price, category, collection, images) VALUES
('Premium Gold Lighter', 'Luxurious gold-plated lighter with elegant design', 2999.00, 'lighters', 'luxury', ARRAY['/products/lighter1.jpg', '/products/lighter2.jpg']),
('Classic Silver Lighter', 'Timeless silver lighter with premium finish', 1999.00, 'lighters', 'standard', ARRAY['/products/lighter2.jpg', '/products/lighter3.jpg']),
('Diamond Edition Lighter', 'Exclusive diamond-studded luxury lighter', 9999.00, 'lighters', 'luxury', ARRAY['/products/lighter3.jpg', '/products/lighter1.jpg']),
('Stainless Steel Flask', 'Premium stainless steel hip flask', 1499.00, 'flask', 'standard', ARRAY['/products/Flask 1.jpg', '/products/Flask 2.jpg']),
('Luxury Engraved Flask', 'Hand-engraved luxury flask with personalization', 2499.00, 'flask', 'luxury', ARRAY['/products/Flask 2.jpg', '/products/Flask 3.jpg']),
('Executive Flask Set', 'Complete flask set with accessories', 3999.00, 'flask', 'luxury', ARRAY['/products/Flask 3.jpg', '/products/Flask 1.jpg'])
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders("userId");
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items("userId");