import { defineConfig } from "drizzle-kit";

// Use Supabase database URL if available, otherwise use fallback
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL || DATABASE_URL === 'postgresql://localhost:5432/temp_db') {
  console.warn('⚠️ DATABASE_URL not properly configured in drizzle config.');
  console.warn('💡 To use database migrations, set DATABASE_URL in your .env file with your Supabase database connection string.');
  console.warn('📝 Format: postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres');
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL || 'postgresql://localhost:5432/temp_db',
  },
});