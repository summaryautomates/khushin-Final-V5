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
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3;

// Initialize database connection with retry logic
async function initializeDatabase() {
  // Always set up Supabase client first as fallback
  if (supabaseUrl && supabaseAnonKey) {
    try {
      supabase = createClient(supabaseUrl, supabaseAnonKey);
      console.log('✅ Supabase client initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Supabase client:', error);
    }
  } else {
    console.warn('⚠️ Supabase configuration missing - some features may be limited');
  }

  // Try direct database connection if DATABASE_URL is available
  if (DATABASE_URL && DATABASE_URL !== 'postgresql://localhost:5432/temp_db') {
    console.log('Attempting direct database connection...');
    
    while (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
      try {
        connectionAttempts++;
        console.log(`Database connection attempt ${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS}`);
        
        const client = postgres(DATABASE_URL, {
          ssl: { rejectUnauthorized: false },
          max: 10,
          idle_timeout: 20,
          connect_timeout: 10,
          transform: {
            undefined: null
          }
        });
        
        db = drizzle(client, { schema });
        
        // Test the connection with timeout
        const testQuery = client`SELECT 1 as test`;
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 5000)
        );
        
        await Promise.race([testQuery, timeoutPromise]);
        console.log('✅ Direct database connection established successfully');
        return true;
      } catch (error) {
        console.error(`❌ Database connection attempt ${connectionAttempts} failed:`, error);
        db = null;
        
        if (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
          const delay = connectionAttempts * 2000; // Exponential backoff
          console.log(`Waiting ${delay}ms before next attempt...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.error('❌ All direct database connection attempts failed');
    return false;
  } else {
    console.log('DATABASE_URL not configured - using Supabase client only');
    return supabase !== null;
  }
}

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    // First try to initialize the database if not already done
    if (!db && !supabase) {
      const initialized = await initializeDatabase();
      if (!initialized) {
        console.warn('⚠️ No database connection available');
        return false;
      }
    }

    if (db) {
      // Test direct database connection
      try {
        await db.execute('SELECT 1 as health_check');
        console.log('✅ Database health check passed (direct connection)');
        return true;
      } catch (error) {
        console.error('❌ Direct database health check failed:', error);
        db = null; // Reset connection for retry
      }
    }
    
    if (supabase) {
      // Test Supabase connection as fallback
      try {
        const { data, error } = await supabase.from('products').select('id').limit(1);
        if (!error || error.code === 'PGRST116') { // Table not found is acceptable for health check
          console.log('✅ Database health check passed (Supabase fallback)');
          return true;
        }
        console.error('❌ Supabase health check failed:', error);
      } catch (error) {
        console.error('❌ Supabase health check error:', error);
      }
    }
    
    // If we reach here, try to reinitialize
    console.log('Attempting to reinitialize database connection...');
    connectionAttempts = 0; // Reset attempts counter
    const reinitialized = await initializeDatabase();
    if (reinitialized) {
      console.log('✅ Database connection reinitialized successfully');
      return true;
    }
    
    console.log('⚠️ Database unavailable - server will start with limited functionality');
    return false;
    
  } catch (error) {
    console.error('❌ Database health check failed:', error);
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