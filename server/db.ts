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

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

export const sampleProducts = [
  {
    id: 1,
    name: "Regal Gold Essence",
    description: "24K gold-plated luxury lighter with intricate Art Deco engravings and premium butane ignition system",
    price: 499900,
    images: [
      "/attached_assets/93robnxJuGA81CI0-generated_image.jpg",
      "https://images.unsplash.com/photo-1675789652363-e2f09f5e40d9?w=800&q=90"
    ],
    category: "lighters",
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
    images: [
      "/attached_assets/oKlJonOsIQgIBznu-generated_image.jpg",
      "https://images.unsplash.com/photo-1675789652903-e5e60f4bb19d?w=800&q=90"
    ],
    category: "lighters"
  },
  {
    id: 3,
    name: "Heritage Rose Gold",
    description: "Rose gold lighter with vintage-inspired design and temperature-resistant ceramic coating",
    price: 399900,
    images: [
      "/attached_assets/93robnxJuGA81CI0-generated_image.jpg",
      "/attached_assets/oKlJonOsIQgIBznu-generated_image.jpg"
    ],
    category: "lighters"
  },
  {
    id: 4,
    name: "Titanium Stealth Pro",
    description: "Aircraft-grade titanium lighter with matte black finish and precision flame control",
    price: 299900,
    images: [
      "/attached_assets/oKlJonOsIQgIBznu-generated_image.jpg",
      "/attached_assets/93robnxJuGA81CI0-generated_image.jpg"
    ],
    category: "lighters"
  },
  {
    id: 5,
    name: "Silver Guilloche Edition",
    description: "Sterling silver lighter featuring traditional guilloche engraving and double flame system",
    price: 599900,
    images: [
      "/attached_assets/93robnxJuGA81CI0-generated_image.jpg",
      "/attached_assets/oKlJonOsIQgIBznu-generated_image.jpg"
    ],
    category: "lighters"
  },
  {
    id: 6,
    name: "Premium Butane Refill Kit",
    description: "Ultra-refined triple-filtered butane fuel with universal adapter set",
    price: 49900,
    images: [
      "https://images.unsplash.com/photo-1675789653233-a5e5bde363f7?w=800&q=90",
      "https://images.unsplash.com/photo-1675789653295-20df7a1d5665?w=800&q=90"
    ],
    category: "refueling"
  },
  {
    id: 7,
    name: "Master Service Kit",
    description: "Complete lighter maintenance kit with premium tools and cleaning solutions",
    price: 129900,
    images: [
      "https://images.unsplash.com/photo-1675789652575-0a5dd196b4ba?w=800&q=90",
      "https://images.unsplash.com/photo-1675789652363-e2f09f5e40d9?w=800&q=90"
    ],
    category: "refueling"
  },
  {
    id: 8,
    name: "Elite Flint Pack",
    description: "Premium replacement flints with brass housing, pack of 10",
    price: 29900,
    images: [
      "https://images.unsplash.com/photo-1675789652871-36b796381d11?w=800&q=90",
      "https://images.unsplash.com/photo-1675789652903-e5e60f4bb19d?w=800&q=90"
    ],
    category: "refueling"
  },
  {
    id: 9,
    name: "Luxury Travel Kit",
    description: "Compact refueling and maintenance kit in genuine leather case",
    price: 89900,
    images: [
      "https://images.unsplash.com/photo-1675789653233-a5e5bde363f7?w=800&q=90",
      "https://images.unsplash.com/photo-1675789653295-20df7a1d5665?w=800&q=90"
    ],
    category: "refueling"
  },
  {
    id: 10,
    name: "Professional Wick Kit",
    description: "Premium cotton wick replacements with installation tools",
    price: 39900,
    images: [
      "https://images.unsplash.com/photo-1675789652575-0a5dd196b4ba?w=800&q=90",
      "https://images.unsplash.com/photo-1675789652363-e2f09f5e40d9?w=800&q=90"
    ],
    category: "refueling"
  }
];