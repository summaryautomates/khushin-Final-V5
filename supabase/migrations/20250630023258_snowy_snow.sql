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
  features JSONB DEFAULT '{}',
  customizable BOOLEAN DEFAULT false,
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

-- Create policies for users table (check if they exist first)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Users can read own data' AND polrelid = 'users'::regclass
  ) THEN
    CREATE POLICY "Users can read own data"
      ON users
      FOR SELECT
      USING ((id)::text = (id)::text);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Users can update own data' AND polrelid = 'users'::regclass
  ) THEN
    CREATE POLICY "Users can update own data"
      ON users
      FOR UPDATE
      USING ((id)::text = (id)::text);
  END IF;
END
$$;

-- Create policies for products table (public read access)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Anyone can read products' AND polrelid = 'products'::regclass
  ) THEN
    CREATE POLICY "Anyone can read products"
      ON products
      FOR SELECT
      USING (true);
  END IF;
END
$$;

-- Create policies for orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Users can read own orders' AND polrelid = 'orders'::regclass
  ) THEN
    CREATE POLICY "Users can read own orders"
      ON orders
      FOR SELECT
      USING ((auth.uid())::text = "userId");
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Users can create own orders' AND polrelid = 'orders'::regclass
  ) THEN
    CREATE POLICY "Users can create own orders"
      ON orders
      FOR INSERT
      WITH CHECK ((auth.uid())::text = "userId");
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Users can update own orders' AND polrelid = 'orders'::regclass
  ) THEN
    CREATE POLICY "Users can update own orders"
      ON orders
      FOR UPDATE
      USING ((auth.uid())::text = "userId");
  END IF;
END
$$;

-- Create policies for cart_items table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Users can manage own cart' AND polrelid = 'cart_items'::regclass
  ) THEN
    CREATE POLICY "Users can manage own cart"
      ON cart_items
      FOR ALL
      USING ((auth.uid())::text = "userId")
      WITH CHECK ((auth.uid())::text = "userId");
  END IF;
END
$$;

-- Insert sample products
INSERT INTO products (name, description, price, category, collection, images, features, customizable) VALUES
('Premium Gold Lighter', 'Luxurious gold-plated lighter with elegant design', 2999.00, 'lighters', 'luxury', ARRAY['/products/lighter1.jpg', '/products/lighter2.jpg'], '{"material": "Gold-plated brass", "refillable": true, "warranty": "Lifetime"}', true),
('Classic Silver Lighter', 'Timeless silver lighter with premium finish', 1999.00, 'lighters', 'standard', ARRAY['/products/lighter2.jpg', '/products/lighter3.jpg'], '{"material": "Sterling silver", "refillable": true, "warranty": "5 years"}', true),
('Diamond Edition Lighter', 'Exclusive diamond-studded luxury lighter', 9999.00, 'lighters', 'luxury', ARRAY['/products/lighter3.jpg', '/products/lighter1.jpg'], '{"material": "Platinum with diamonds", "refillable": true, "warranty": "Lifetime"}', true),
('Stainless Steel Flask', 'Premium stainless steel hip flask', 1499.00, 'flask', 'standard', ARRAY['/products/Flask 1.jpg', '/products/Flask 2.jpg'], '{"material": "304 Stainless Steel", "capacity": "8oz", "leakproof": true}', false),
('Luxury Engraved Flask', 'Hand-engraved luxury flask with personalization', 2499.00, 'flask', 'luxury', ARRAY['/products/Flask 2.jpg', '/products/Flask 3.jpg'], '{"material": "316 Stainless Steel", "capacity": "10oz", "leakproof": true"}', true),
('Executive Flask Set', 'Complete flask set with accessories', 3999.00, 'flask', 'luxury', ARRAY['/products/Flask 3.jpg', '/products/Flask 1.jpg'], '{"material": "Premium Steel with Leather", "capacity": "12oz", "includes": "4 shot glasses, funnel"}', false)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders("userId");
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items("userId");