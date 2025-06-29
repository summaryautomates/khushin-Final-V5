import { defineConfig } from "drizzle-kit";

// Use fallback for development if DATABASE_URL is not set
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/temp_db';

if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL not set in drizzle config. Please add it to your .env file.');
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
});