import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Get Supabase configuration from environment
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Check if DATABASE_URL is set for direct database connection
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_m2gYrtGfDna5@ep-misty-wave-a5yxp4e1.us-east-2.aws.neon.tech/neondb?sslmode=require';

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
  if (DATABASE_URL) {
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

export async function checkDatabaseHealth(): Promise<{healthy: boolean, error?: string}> {
  try {
    // First try to initialize the database if not already done
    if (!db && !supabase) {
      const initialized = await initializeDatabase();
      if (!initialized) {
        console.warn('⚠️ No database connection available');
        return {healthy: false, error: 'No database connection available'};
      }
    }

    if (db) {
      // Test direct database connection
      try {
        await db.execute('SELECT 1 as health_check');
        console.log('✅ Database health check passed (direct connection)');
        return {healthy: true};
      } catch (error) {
        console.error('❌ Direct database health check failed:', error);
        db = null; // Reset connection for retry
        return {healthy: false, error: error instanceof Error ? error.message : 'Unknown database error'};
      }
    }
    
    if (supabase) {
      // Test Supabase connection as fallback
      try {
        const { data, error } = await supabase.from('products').select('id').limit(1);
        if (!error || error.code === 'PGRST116') { // Table not found is acceptable for health check
          console.log('✅ Database health check passed (Supabase fallback)');
          return {healthy: true};
        }
        console.error('❌ Supabase health check failed:', error);
        return {healthy: false, error: error.message || 'Supabase connection failed'};
      } catch (error) {
        console.error('❌ Supabase health check error:', error);
        return {healthy: false, error: error instanceof Error ? error.message : 'Unknown Supabase error'};
      }
    }
    
    return {healthy: false, error: 'No database connection available'};
    
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return {healthy: false, error: error instanceof Error ? error.message : 'Unknown error during health check'};
  }
}

// Initialize database connection on module load
initializeDatabase().catch(error => {
  console.error('Failed to initialize database on startup:', error);
});

// Export both db and supabase for different use cases
export { db, supabase };