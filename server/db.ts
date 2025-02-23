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

// Configure pool with optimized settings
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  max: 5, // Reduce maximum clients further
  idleTimeoutMillis: 10000,
  keepAlive: true,
});

// Simplified error handling
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

// Connection monitoring
pool.on('connect', () => {
  console.log('New database connection established');
});

pool.on('acquire', () => {
  console.log('Connection pool status:', {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
    timestamp: new Date().toISOString()
  });
});

export const db = drizzle(pool, { schema });

// Export sample products 
export const sampleProducts = [
  {
    id: 1,
    name: "Regal Gold Essence",
    description: "24K gold-plated luxury lighter with intricate Art Deco engravings",
    price: 499900,
    category: "lighters",
    images: [
      "https://assets.langimg.com/photo/97301547/97301547.jpg",
      "https://m.media-amazon.com/images/I/71RoB2mxAbL._AC_UF1000,1000_QL80_.jpg"
    ],
    customizable: true,
    features: {
      material: "24K Gold Plated",
      mechanism: "Premium Butane",
      style: "Art Deco"
    }
  },
  {
    id: 2,
    name: "Platinum Diamond Elite",
    description: "Platinum-coated lighter adorned with genuine diamonds, featuring windproof technology",
    price: 799900,
    category: "lighters",
    images: [
      "https://cdn.shopify.com/s/files/1/0552/4827/8531/files/lighter_8.jpg",
      "https://i.pinimg.com/originals/36/f4/89/36f489b5a40445cc8af6c2914e6249e1.jpg"
    ],
    customizable: true,
    features: {
      material: "Platinum",
      mechanism: "Windproof",
      style: "Modern Luxury"
    }
  },
  {
    id: 3,
    name: "Heritage Rose Gold",
    description: "Rose gold lighter with vintage-inspired design and temperature-resistant ceramic coating",
    price: 399900,
    category: "lighters",
    images: [
      "https://i.pinimg.com/736x/eb/d5/f0/ebd5f0f4d8d971ed5c62759fc1a757e3.jpg",
      "https://cdn.shopify.com/s/files/1/0552/4827/8531/files/lighter_7.jpg"
    ],
    customizable: true,
    features: {
      material: "Rose Gold",
      mechanism: "Ceramic Coated",
      style: "Vintage"
    }
  },
  {
    id: 4,
    name: "Titanium Stealth Pro",
    description: "Aircraft-grade titanium lighter with matte black finish and precision flame control",
    price: 299900,
    category: "lighters",
    images: [
      "https://m.media-amazon.com/images/I/61vhPzw4XaL._AC_UF894,1000_QL80_.jpg",
      "https://i.pinimg.com/736x/0f/c7/7e/0fc77e728ac898c48d77614648da087d.jpg"
    ],
    customizable: true,
    features: {
      material: "Titanium",
      mechanism: "Precision Control",
      style: "Modern"
    }
  },
  {
    id: 5,
    name: "Silver Guilloche Edition",
    description: "Sterling silver lighter featuring traditional guilloche engraving and double flame system",
    price: 599900,
    category: "lighters",
    images: [
      "https://cdn.shopify.com/s/files/1/0552/4827/8531/files/lighter_2.jpg",
      "https://i.pinimg.com/originals/a2/11/ea/a211ea8a392b2b1bf66ab9362d3359eb.jpg"
    ],
    customizable: true,
    features: {
      material: "Sterling Silver",
      mechanism: "Double Flame",
      style: "Classic"
    }
  },
  {
    id: 6,
    name: "Premium Butane Refill Kit",
    description: "Ultra-refined triple-filtered butane fuel with universal adapter set",
    price: 49900,
    category: "refueling",
    images: [
      "https://m.media-amazon.com/images/I/71K1ZHMH6tL._AC_UF1000,1000_QL80_.jpg",
      "https://m.media-amazon.com/images/I/81J7PF9qi5L._AC_UF894,1000_QL80_.jpg"
    ],
    customizable: false,
    features: {
      type: "Refill",
      content: "300ml",
      compatibility: "Universal"
    }
  },
  {
    id: 7,
    name: "Master Service Kit",
    description: "Complete lighter maintenance kit with premium tools and cleaning solutions",
    price: 129900,
    category: "refueling",
    images: [
      "https://m.media-amazon.com/images/I/71dZD4WAqwL._AC_UF1000,1000_QL80_.jpg",
      "https://m.media-amazon.com/images/I/81vTHtTxm1L._AC_UF894,1000_QL80_.jpg"
    ],
    customizable: false,
    features: {
      type: "Maintenance",
      includes: ["Tools", "Cleaning Solution", "Spare Parts"],
      usage: "Professional"
    }
  },
  {
    id: 8,
    name: "Elite Flint Pack",
    description: "Premium replacement flints with brass housing, pack of 10",
    price: 29900,
    category: "refueling",
    images: [
      "https://m.media-amazon.com/images/I/61vGPvmZbIL._AC_UF1000,1000_QL80_.jpg",
      "https://m.media-amazon.com/images/I/71HF1wc0NHL._AC_UF894,1000_QL80_.jpg"
    ],
    customizable: false,
    features: {
      type: "Flints",
      quantity: 10,
      material: "Premium Grade"
    }
  },
  {
    id: 9,
    name: "Luxury Travel Kit",
    description: "Compact refueling and maintenance kit in genuine leather case",
    price: 89900,
    category: "refueling",
    images: [
      "https://m.media-amazon.com/images/I/81KW2j9wIYL._AC_UF1000,1000_QL80_.jpg",
      "https://m.media-amazon.com/images/I/71gB5YZQTML._AC_UF894,1000_QL80_.jpg"
    ],
    customizable: false,
    features: {
      type: "Travel Kit",
      case: "Genuine Leather",
      contents: ["Fuel", "Tools", "Case"]
    }
  },
  {
    id: 10,
    name: "Professional Wick Kit",
    description: "Premium cotton wick replacements with installation tools",
    price: 39900,
    category: "refueling",
    images: [
      "https://m.media-amazon.com/images/I/61X3C8oCm1L._AC_UF1000,1000_QL80_.jpg",
      "https://m.media-amazon.com/images/I/71r8oYYtEbL._AC_UF894,1000_QL80_.jpg"
    ],
    customizable: false,
    features: {
      type: "Wicks",
      material: "Premium Cotton",
      includes: "Installation Tools"
    }
  }
];