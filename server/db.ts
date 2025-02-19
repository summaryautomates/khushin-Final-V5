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
      "https://images.unsplash.com/photo-1681411576221-b909073c5ea7?w=800&q=90",
      "https://images.unsplash.com/photo-1681411576391-741ba8f3a11c?w=800&q=90",
      "https://images.unsplash.com/photo-1681411576485-60b58ce6b507?w=800&q=90"
    ],
    category: "lighters"
  },
  {
    id: 2, 
    name: "Silver Diamond Edition",
    description: "Premium silver lighter with diamond accents",
    price: 499900,
    images: [
      "https://images.unsplash.com/photo-1681411576543-1dadf9b7129e?w=800&q=90",
      "https://images.unsplash.com/photo-1681411576599-f31f65cadc3e?w=800&q=90",
      "https://images.unsplash.com/photo-1681411576657-f54721f71b03?w=800&q=90"
    ],
    category: "lighters"
  },
  {
    id: 3,
    name: "Premium Fuel Can",
    description: "High-quality lighter fluid refill can",
    price: 29900,
    images: [
      "https://images.unsplash.com/photo-1681411576711-9c7745a77476?w=800&q=90",
      "https://images.unsplash.com/photo-1681411576769-e8cf161e2d97?w=800&q=90",
      "https://images.unsplash.com/photo-1681411576827-e8cf161e2d97?w=800&q=90"
    ],
    category: "refueling"
  }
];

//Example usage of the products array (this would be part of a larger application)
console.log(products);