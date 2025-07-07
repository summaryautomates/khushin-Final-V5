/*
# Schema update for KHUSH.IN e-commerce platform

1. New Tables
   - `users` - User accounts with authentication
   - `products` - Product catalog with details
   - `orders` - Customer orders with shipping and payment info
   - `cart_items` - Shopping cart items with gift options

2. Security
   - Enable RLS on all tables
   - Add policies for user data protection
   - Public read access for products

3. Sample Data
   - Add sample luxury products
*/

-- Create users table
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

-- Create products table
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

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  orderRef VARCHAR(255) NOT NULL UNIQUE,
  userId VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  total NUMERIC(10,2) NOT NULL,
  items TEXT NOT NULL,
  shipping TEXT NOT NULL,
  paymentMethod VARCHAR(50),
  trackingNumber VARCHAR(255),
  trackingStatus VARCHAR(100),
  estimatedDelivery TIMESTAMPTZ,
  createdAt TIMESTAMPTZ DEFAULT now(),
  lastUpdated TIMESTAMPTZ DEFAULT now()
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  productId INTEGER NOT NULL,
  quantity INTEGER DEFAULT 1 NOT NULL,
  isGift BOOLEAN DEFAULT false,
  giftMessage TEXT,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(userId, productId)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders("userId");
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items("userId");

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Create security policies
-- Users can read own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING ((id)::text = (uid())::text);

-- Users can update own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING ((id)::text = (uid())::text);

-- Anyone can read products
CREATE POLICY "Anyone can read products"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Users can read own orders
CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING ((uid())::text = ("userId")::text);

-- Users can create own orders
CREATE POLICY "Users can create own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK ((uid())::text = ("userId")::text);

-- Users can update own orders
CREATE POLICY "Users can update own orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING ((uid())::text = ("userId")::text);

-- Users can manage own cart
CREATE POLICY "Users can manage own cart"
  ON cart_items
  FOR ALL
  TO authenticated
  USING ((uid())::text = ("userId")::text)
  WITH CHECK ((uid())::text = ("userId")::text);

-- Insert sample luxury products
INSERT INTO products (name, description, price, category, collection, images, features, customizable)
VALUES
  ('Luxury Gold Lighter', 'Premium gold-plated lighter with elegant design', 299900, 'Lighter', 'luxury', 
   ARRAY['/placeholders/product-placeholder.svg'], 
   '{"material": "Gold-plated", "refillable": true, "warranty": "Lifetime"}', 
   true),
   
  ('Silver Pocket Lighter', 'Compact silver lighter perfect for everyday use', 149900, 'Lighter', 'standard', 
   ARRAY['/placeholders/product-placeholder.svg'], 
   '{"material": "Silver", "refillable": true, "warranty": "5 years"}', 
   false),
   
  ('Premium Flask', 'Stainless steel flask with leather wrapping', 189900, 'Flask', 'premium', 
   ARRAY['/placeholders/product-placeholder.svg'], 
   '{"material": "Stainless Steel", "capacity": "8oz", "leatherWrap": true}', 
   true),
   
  ('Vintage Collection Lighter', 'Classic design with modern functionality', 249900, 'Lighter', 'luxury', 
   ARRAY['/placeholders/product-placeholder.svg'], 
   '{"material": "Brass", "refillable": true, "vintage": true}', 
   true);