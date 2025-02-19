import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

const products = [
  {
    id: 1,
    name: "Classic Gold Lighter",
    description: "Elegant gold-plated lighter with timeless design",
    price: 299900,
    images: [
      "https://images.unsplash.com/photo-1619891669534-4466578464aa?w=800&q=90",
      "https://images.unsplash.com/photo-1619891669531-da40c85bd785?w=800&q=90",
      "https://images.unsplash.com/photo-1619891669537-7c3b68000d75?w=800&q=90"
    ],
    category: "lighters"
  },
  {
    id: 2, 
    name: "Silver Diamond Edition",
    description: "Premium silver lighter with diamond accents",
    price: 499900,
    images: [
      "https://images.unsplash.com/photo-1587851981831-d2443e50f09d?w=800&q=90",
      "https://images.unsplash.com/photo-1587851981825-40f52d2a61c8?w=800&q=90",
      "https://images.unsplash.com/photo-1587851981822-2b6b53fdb50a?w=800&q=90"
    ],
    category: "lighters"
  },
  {
    id: 3,
    name: "Premium Fuel Can",
    description: "High-quality lighter fluid refill can",
    price: 29900,
    images: [
      "https://images.unsplash.com/photo-1583947582886-f40c0c0c9a65?w=800&q=90",
      "https://images.unsplash.com/photo-1583947582889-c2ce8614eea7?w=800&q=90"
    ],
    category: "refueling"
  }
];

//Example usage of the products array (this would be part of a larger application)
console.log(products);