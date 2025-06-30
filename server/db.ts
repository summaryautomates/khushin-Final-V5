import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as schema from "@shared/schema";

// Get database configuration from environment
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_m2gYrtGfDna5@ep-misty-wave-a5yxp4e1.us-east-2.aws.neon.tech/neondb?sslmode=require';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('✅ Supabase client initialized');
} else {
  console.warn('⚠️ Supabase credentials not found in environment variables');
}

let db: any = null;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3;

// Initialize database connection with retry logic
async function initializeDatabase() {
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not configured');
    return false;
  }

  console.log('Attempting direct database connection...');
  
  while (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
    try {
      connectionAttempts++;
      console.log(`Database connection attempt ${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS}`);
      
      const client = postgres(DATABASE_URL, {
        ssl: { rejectUnauthorized: false },
        max: 5, // Reduced connection pool size
        idle_timeout: 20,
        connect_timeout: 120, // Increased from 90 to 120 seconds
        transform: {
          undefined: null
        },
        onnotice: () => {}, // Suppress notices
        debug: false // Disable debug logging
      });
      
      db = drizzle(client, { schema });
      
      // Test the connection with longer timeout - increased from 60 to 90 seconds
      const testQuery = client`SELECT 1 as test`;
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 90000) // Increased from 60 to 90 seconds
      );
      
      await Promise.race([testQuery, timeoutPromise]);
      console.log('✅ Direct database connection established successfully');
      return true;
    } catch (error) {
      console.error(`❌ Database connection attempt ${connectionAttempts} failed:`, error);
      db = null;
      
      if (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
        const delay = connectionAttempts * 5000; // Increased from 3000 to 5000ms
        console.log(`Waiting ${delay}ms before next attempt...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error('❌ All direct database connection attempts failed');
  return false;
}

export async function checkDatabaseHealth(): Promise<{healthy: boolean, error?: string}> {
  try {
    // First try to initialize the database if not already done
    if (!db) {
      const initialized = await initializeDatabase();
      if (!initialized) {
        console.warn('⚠️ No database connection available');
        return {healthy: false, error: 'No database connection available'};
      }
    }

    if (db) {
      // Test direct database connection with increased timeout - increased from 45 to 60 seconds
      try {
        const healthCheckPromise = db.execute('SELECT 1 as health_check');
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Health check timeout')), 60000) // Increased from 45 to 60 seconds
        );
        
        await Promise.race([healthCheckPromise, timeoutPromise]);
        console.log('✅ Database health check passed');
        return {healthy: true};
      } catch (error) {
        console.error('❌ Database health check failed:', error);
        db = null; // Reset connection for retry
        return {healthy: false, error: error instanceof Error ? error.message : 'Unknown database error'};
      }
    }
    
    return {healthy: false, error: 'No database connection available'};
    
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return {healthy: false, error: error instanceof Error ? error.message : 'Unknown error during health check'};
  }
}

// Graceful shutdown handler
process.on('SIGINT', async () => {
  console.log('Shutting down database connections...');
  if (db) {
    try {
      await db.$client.end();
      console.log('Database connections closed');
    } catch (error) {
      console.error('Error closing database connections:', error);
    }
  }
  process.exit(0);
});

// Initialize database connection on module load with error handling
initializeDatabase().catch(error => {
  console.error('Failed to initialize database on startup:', error);
  // Don't exit the process, let the application continue without database
});

// Export db and supabase for use in other modules
export { db, supabase };