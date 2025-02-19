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
      "https://images.unsplash.com/photo-1675789652575-0a5dd196b4ba?w=800&q=90",
      "https://images.unsplash.com/photo-1675789652363-e2f09f5e40d9?w=800&q=90",
      "https://images.unsplash.com/photo-1675789652432-e85c0fc097a9?w=800&q=90"
    ],
    category: "lighters"
  },
  {
    id: 2, 
    name: "Silver Diamond Edition",
    description: "Premium silver lighter with diamond accents",
    price: 499900,
    images: [
      "https://images.unsplash.com/photo-1675789652871-36b796381d11?w=800&q=90",
      "https://images.unsplash.com/photo-1675789652903-e5e60f4bb19d?w=800&q=90",
      "https://images.unsplash.com/photo-1675789652941-18dd1a7b2eba?w=800&q=90"
    ],
    category: "lighters"
  },
  {
    id: 3,
    name: "Premium Fuel Can",
    description: "High-quality lighter fluid refill can",
    price: 29900,
    images: [
      "https://images.unsplash.com/photo-1675789653233-a5e5bde363f7?w=800&q=90",
      "https://images.unsplash.com/photo-1675789653295-20df7a1d5665?w=800&q=90",
      "https://images.unsplash.com/photo-1675789653265-e0ad6d53f55c?w=800&q=90"
    ],
    category: "refueling"
  }
];

//Example usage of the products array (this would be part of a larger application)
console.log(products);