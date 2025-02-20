import { drizzle } from 'drizzle-orm/neon-http';
import { neon, neonConfig } from '@neondatabase/serverless';
import * as schema from '@shared/schema';
import { WebSocket } from 'ws';

// Enable WebSocket connections for better performance
neonConfig.webSocketConstructor = WebSocket;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });

// Sample products for development
export const sampleProducts = [
  {
    id: 1,
    name: "Regal Gold Essence",
    description: "24K gold-plated luxury lighter with intricate Art Deco engravings",
    price: 499900,
    category: "lighters",
    images: ["/images/lighter-1.jpg", "/images/lighter-1-alt.jpg"],
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
    images: ["/images/lighter-2.jpg", "/images/lighter-2-alt.jpg"]
  },
  {
    id: 3,
    name: "Heritage Rose Gold",
    description: "Rose gold lighter with vintage-inspired design and temperature-resistant ceramic coating",
    price: 399900,
    category: "lighters",
    images: ["/images/lighter-3.jpg", "/images/lighter-3-alt.jpg"]
  },
  {
    id: 4,
    name: "Titanium Stealth Pro",
    description: "Aircraft-grade titanium lighter with matte black finish and precision flame control",
    price: 299900,
    category: "lighters",
    images: ["/images/lighter-4.jpg", "/images/lighter-4-alt.jpg"]
  },
  {
    id: 5,
    name: "Silver Guilloche Edition",
    description: "Sterling silver lighter featuring traditional guilloche engraving and double flame system",
    price: 599900,
    category: "lighters",
    images: ["/images/lighter-5.jpg", "/images/lighter-5-alt.jpg"]
  },
  {
    id: 6,
    name: "Premium Butane Refill Kit",
    description: "Ultra-refined triple-filtered butane fuel with universal adapter set",
    price: 49900,
    images: ["/images/refill-1.jpg", "/images/refill-1-alt.jpg"],
    category: "refueling"
  },
  {
    id: 7,
    name: "Master Service Kit",
    description: "Complete lighter maintenance kit with premium tools and cleaning solutions",
    price: 129900,
    images: ["/images/refill-2.jpg", "/images/refill-2-alt.jpg"],
    category: "refueling"
  },
  {
    id: 8,
    name: "Elite Flint Pack",
    description: "Premium replacement flints with brass housing, pack of 10",
    price: 29900,
    images: ["/images/refill-3.jpg", "/images/refill-3-alt.jpg"],
    category: "refueling"
  },
  {
    id: 9,
    name: "Luxury Travel Kit",
    description: "Compact refueling and maintenance kit in genuine leather case",
    price: 89900,
    images: ["/images/refill-4.jpg", "/images/refill-4-alt.jpg"],
    category: "refueling"
  },
  {
    id: 10,
    name: "Professional Wick Kit",
    description: "Premium cotton wick replacements with installation tools",
    price: 39900,
    images: ["/images/refill-5.jpg", "/images/refill-5-alt.jpg"],
    category: "refueling"
  }
];