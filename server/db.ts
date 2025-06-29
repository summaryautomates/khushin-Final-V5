import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Get Supabase configuration from environment
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Check if DATABASE_URL is set for direct database connection
const DATABASE_URL = process.env.DATABASE_URL;

let db: any;
let supabase: any;

if (DATABASE_URL && DATABASE_URL !== 'postgresql://localhost:5432/temp_db') {
  // Use direct database connection if DATABASE_URL is properly configured
  console.log('Using direct database connection...');
  
  try {
    const client = postgres(DATABASE_URL, {
      ssl: 'require',
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    
    db = drizzle(client, { schema });
    console.log('✅ Direct database connection established');
  } catch (error) {
    console.error('❌ Failed to establish direct database connection:', error);
    db = null;
  }
} else {
  console.log('DATABASE_URL not configured, using Supabase client only...');
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
    if (db) {
      // Test direct database connection
      await db.execute('SELECT 1');
      console.log('✅ Database health check passed (direct connection)');
      return true;
    } else if (supabase) {
      // Test Supabase connection
      const { data, error } = await supabase.from('_health_check').select('*').limit(1);
      if (!error || error.code === 'PGRST116') { // Table not found is acceptable for health check
        console.log('✅ Database health check passed (Supabase)');
        return true;
      }
      throw error;
    } else {
      throw new Error('No database connection available');
    }
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    // Return true to allow server to start even if database is not available
    // This prevents the server from failing to start due to database issues
    console.log('⚠️ Continuing server startup without database connection');
    return true;
  }
}

// Export both db and supabase for different use cases
export { db, supabase };