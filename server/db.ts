import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Get Supabase configuration from environment
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Check if DATABASE_URL is set for direct database connection
const DATABASE_URL = process.env.DATABASE_URL;

let db: any = null;
let supabase: any = null;

// Initialize database connection
async function initializeDatabase() {
  if (DATABASE_URL && DATABASE_URL !== 'postgresql://localhost:5432/temp_db') {
    // Use direct database connection if DATABASE_URL is properly configured
    console.log('Initializing direct database connection...');
    
    try {
      const client = postgres(DATABASE_URL, {
        ssl: { rejectUnauthorized: false },
        max: 10,
        idle_timeout: 20,
        connect_timeout: 10,
      });
      
      db = drizzle(client, { schema });
      
      // Test the connection
      await client`SELECT 1`;
      console.log('✅ Direct database connection established successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to establish direct database connection:', error);
      db = null;
      return false;
    }
  } else {
    console.log('DATABASE_URL not configured properly');
    return false;
  }
}

// Always set up Supabase client for auth and other features
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('✅ Supabase client initialized');
} else {
  console.error('❌ Supabase configuration missing');
}

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    // First try to initialize the database if not already done
    if (!db) {
      const initialized = await initializeDatabase();
      if (!initialized) {
        throw new Error('Failed to initialize database connection');
      }
    }

    if (db) {
      // Test direct database connection
      const result = await db.execute('SELECT 1 as health_check');
      console.log('✅ Database health check passed (direct connection)');
      return true;
    } else if (supabase) {
      // Test Supabase connection as fallback
      const { data, error } = await supabase.from('products').select('id').limit(1);
      if (!error || error.code === 'PGRST116') { // Table not found is acceptable for health check
        console.log('✅ Database health check passed (Supabase fallback)');
        return true;
      }
      throw error;
    } else {
      throw new Error('No database connection available');
    }
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    
    // If we don't have a database connection, try to initialize it
    if (!db) {
      console.log('Attempting to initialize database connection...');
      const initialized = await initializeDatabase();
      if (initialized) {
        console.log('✅ Database connection initialized successfully');
        return true;
      }
    }
    
    // Return false to indicate database is not available
    // This will allow the server to start but with limited functionality
    console.log('⚠️ Database unavailable - server will start with limited functionality');
    return false;
  }
}

// Initialize database connection on module load
initializeDatabase().catch(error => {
  console.error('Failed to initialize database on startup:', error);
});

// Export both db and supabase for different use cases
export { db, supabase };