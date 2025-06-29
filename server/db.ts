import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Check if DATABASE_URL is set, provide a fallback for development
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/temp_db';

if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL not set. Using temporary fallback. Please set DATABASE_URL in your .env file for proper database functionality.');
}

const { Pool } = pg;

// Create pool with error handling for missing database
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.DATABASE_URL ? {
    rejectUnauthorized: false
  } : false
});

// Test the connection with better error handling
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
    console.log('💡 To fix this: Add DATABASE_URL to your .env file with your PostgreSQL connection string');
  } else {
    console.log('✅ Database connected successfully');
  }
});

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const result = await pool.query('SELECT 1');
    return result.rowCount === 1;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

export const db = drizzle(pool, { schema });