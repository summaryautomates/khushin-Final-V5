/*
  # Fix Schema and Policies

  1. New Tables
    - Ensures all required tables exist (products, orders, cart_items, users, Summuryecom)
    - Each table has appropriate columns and constraints
  
  2. Security
    - Enables RLS on all tables
    - Creates policies only if they don't already exist
    - Fixes the "policy already exists" error
  
  3. Indexes
    - Creates performance-optimizing indexes
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

-- Create policies for products (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'products' AND policyname = 'Anyone can read products'
  ) THEN
    CREATE POLICY "Anyone can read products" 
      ON products
      FOR SELECT 
      TO anon, authenticated
      USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'products' AND policyname = 'khushin_products_read_all'
  ) THEN
    CREATE POLICY "khushin_products_read_all" 
      ON products
      FOR SELECT 
      TO anon, authenticated
      USING (true);
  END IF;
END
$$;

-- Create policies for orders (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'orders' AND policyname = 'Users can create own orders'
  ) THEN
    CREATE POLICY "Users can create own orders" 
      ON orders
      FOR INSERT 
      TO authenticated
      WITH CHECK ((auth.uid())::text = ("userId")::text);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'orders' AND policyname = 'Users can read own orders'
  ) THEN
    CREATE POLICY "Users can read own orders" 
      ON orders
      FOR SELECT 
      TO authenticated
      USING ((auth.uid())::text = ("userId")::text);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'orders' AND policyname = 'Users can update own orders'
  ) THEN
    CREATE POLICY "Users can update own orders" 
      ON orders
      FOR UPDATE 
      TO authenticated
      USING ((auth.uid())::text = ("userId")::text);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'orders' AND policyname = 'khushin_orders_create_own'
  ) THEN
    CREATE POLICY "khushin_orders_create_own" 
      ON orders
      FOR INSERT 
      TO authenticated
      WITH CHECK ((auth.uid())::text = ("userId")::text);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'orders' AND policyname = 'khushin_orders_read_own'
  ) THEN
    CREATE POLICY "khushin_orders_read_own" 
      ON orders
      FOR SELECT 
      TO authenticated
      USING ((auth.uid())::text = ("userId")::text);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'orders' AND policyname = 'khushin_orders_update_own'
  ) THEN
    CREATE POLICY "khushin_orders_update_own" 
      ON orders
      FOR UPDATE 
      TO authenticated
      USING ((auth.uid())::text = ("userId")::text);
  END IF;
END
$$;

-- Create policies for cart_items (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'cart_items' AND policyname = 'Users can manage own cart'
  ) THEN
    CREATE POLICY "Users can manage own cart" 
      ON cart_items
      FOR ALL 
      TO authenticated
      USING ((auth.uid())::text = ("userId")::text)
      WITH CHECK ((auth.uid())::text = ("userId")::text);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'cart_items' AND policyname = 'khushin_cart_items_manage_own'
  ) THEN
    CREATE POLICY "khushin_cart_items_manage_own" 
      ON cart_items
      FOR ALL 
      TO authenticated
      USING ((auth.uid())::text = ("userId")::text)
      WITH CHECK ((auth.uid())::text = ("userId")::text);
  END IF;
END
$$;

-- Create policies for users (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Users can read own data'
  ) THEN
    CREATE POLICY "Users can read own data" 
      ON users
      FOR SELECT 
      TO authenticated
      USING ((id)::text = (auth.uid())::text);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Users can update own data'
  ) THEN
    CREATE POLICY "Users can update own data" 
      ON users
      FOR UPDATE 
      TO authenticated
      USING ((id)::text = (auth.uid())::text);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'khushin_users_read_own'
  ) THEN
    CREATE POLICY "khushin_users_read_own" 
      ON users
      FOR SELECT 
      TO authenticated
      USING ((id)::text = (auth.uid())::text);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'khushin_users_update_own'
  ) THEN
    CREATE POLICY "khushin_users_update_own" 
      ON users
      FOR UPDATE 
      TO authenticated
      USING ((id)::text = (auth.uid())::text);
  END IF;
END
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders("userId");
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items("userId");

-- Insert sample luxury products if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM products WHERE name = 'Luxury Gold Lighter') THEN
    INSERT INTO products (name, description, price, category, collection, images, features, customizable)
    VALUES
      ('Luxury Gold Lighter', 'Premium gold-plated lighter with elegant design. This exquisite piece combines timeless elegance with modern functionality, making it the perfect accessory for the discerning individual.', 299900, 'Lighter', 'luxury', 
       ARRAY['/placeholders/product-placeholder.svg'], 
       '{"material": "Gold-plated", "refillable": true, "warranty": "Lifetime", "dimensions": "6.5 x 3.8 x 1.2 cm"}', 
       true);
  END IF;
  
  IF NOT EXISTS (SELECT FROM products WHERE name = 'Silver Pocket Lighter') THEN
    INSERT INTO products (name, description, price, category, collection, images, features, customizable)
    VALUES
      ('Silver Pocket Lighter', 'Compact silver lighter perfect for everyday use. Sleek, reliable, and beautifully crafted, this lighter offers exceptional performance in a sophisticated package.', 149900, 'Lighter', 'standard', 
       ARRAY['/placeholders/product-placeholder.svg'], 
       '{"material": "Silver", "refillable": true, "warranty": "5 years", "dimensions": "5.7 x 3.6 x 1.0 cm"}', 
       false);
  END IF;
  
  IF NOT EXISTS (SELECT FROM products WHERE name = 'Premium Flask') THEN
    INSERT INTO products (name, description, price, category, collection, images, features, customizable)
    VALUES
      ('Premium Flask', 'Stainless steel flask with genuine leather wrapping. Designed for those who appreciate fine craftsmanship, this flask combines durability with luxury for an exceptional experience.', 189900, 'Flask', 'premium', 
       ARRAY['/placeholders/product-placeholder.svg'], 
       '{"material": "Stainless Steel", "capacity": "8oz", "leatherWrap": true, "dimensions": "15 x 9 x 2.2 cm"}', 
       true);
  END IF;
  
  IF NOT EXISTS (SELECT FROM products WHERE name = 'Vintage Collection Lighter') THEN
    INSERT INTO products (name, description, price, category, collection, images, features, customizable)
    VALUES
      ('Vintage Collection Lighter', 'Classic design with modern functionality. This vintage-inspired lighter brings together the aesthetic of a bygone era with contemporary reliability and performance.', 249900, 'Lighter', 'luxury', 
       ARRAY['/placeholders/product-placeholder.svg'], 
       '{"material": "Brass", "refillable": true, "vintage": true, "dimensions": "7.0 x 4.2 x 1.5 cm"}', 
       true);
  END IF;
  
  IF NOT EXISTS (SELECT FROM products WHERE name = 'Diamond Edition Lighter') THEN
    INSERT INTO products (name, description, price, category, collection, images, features, customizable)
    VALUES
      ('Diamond Edition Lighter', 'Our most exclusive lighter featuring genuine diamond accents. The epitome of luxury, this limited edition piece combines precious materials with unparalleled craftsmanship.', 499900, 'Lighter', 'luxury', 
       ARRAY['/placeholders/product-placeholder.svg'], 
       '{"material": "Platinum-plated", "refillable": true, "warranty": "Lifetime", "diamonds": true, "limited": true}', 
       true);
  END IF;
  
  IF NOT EXISTS (SELECT FROM products WHERE name = 'Leather-Wrapped Flask') THEN
    INSERT INTO products (name, description, price, category, collection, images, features, customizable)
    VALUES
      ('Leather-Wrapped Flask', 'Premium stainless steel flask with handcrafted leather exterior. The perfect blend of functionality and style, this flask makes an exceptional gift or personal accessory.', 169900, 'Flask', 'premium', 
       ARRAY['/placeholders/product-placeholder.svg'], 
       '{"material": "Stainless Steel", "capacity": "6oz", "leatherWrap": true, "handcrafted": true}', 
       true);
  END IF;
  
  IF NOT EXISTS (SELECT FROM products WHERE name = 'Titanium Flame Master') THEN
    INSERT INTO products (name, description, price, category, collection, images, features, customizable)
    VALUES
      ('Titanium Flame Master', 'Ultra-durable titanium lighter with adjustable flame. Engineered for performance in any environment, this lighter combines advanced technology with sophisticated design.', 279900, 'Lighter', 'premium', 
       ARRAY['/placeholders/product-placeholder.svg'], 
       '{"material": "Titanium", "refillable": true, "adjustableFlame": true, "windproof": true}', 
       false);
  END IF;
  
  IF NOT EXISTS (SELECT FROM products WHERE name = 'Carbon Fiber Executive') THEN
    INSERT INTO products (name, description, price, category, collection, images, features, customizable)
    VALUES
      ('Carbon Fiber Executive', 'Sleek carbon fiber lighter with matte black finish. Modern, lightweight, and exceptionally durable, this lighter makes a bold statement with its contemporary design.', 229900, 'Lighter', 'premium', 
       ARRAY['/placeholders/product-placeholder.svg'], 
       '{"material": "Carbon Fiber", "refillable": true, "finish": "Matte Black", "ultralight": true}', 
       true);
  END IF;
END
$$;