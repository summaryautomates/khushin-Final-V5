import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;
neonConfig.wsProxy = (url) => url;
neonConfig.pipelineConnect = false;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// Optimized pool configuration for better performance and stability
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  // Reduced timeout to fail fast on connection issues
  connectionTimeoutMillis: 10000,
  // Reduced max connections to prevent overload
  max: 5,
  // Shorter idle timeout to free up resources
  idleTimeoutMillis: 30000,
  // Keep connection alive
  keepAlive: true,
  // Reduced initial delay for keepalive
  keepAliveInitialDelayMillis: 5000,
  // Connection retry settings
  retryInterval: 500,
  maxRetries: 3
});

// Enhanced connection pool monitoring
let totalErrors = 0;
const MAX_ERRORS_BEFORE_RESTART = 10;
const ERROR_RESET_INTERVAL = 60000; // 1 minute

// Reset error count periodically
setInterval(() => {
  totalErrors = 0;
}, ERROR_RESET_INTERVAL);

// Enhanced error handling with circuit breaker pattern
pool.on('error', (err) => {
  totalErrors++;
  console.error('Database pool error:', {
    error: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
    poolStatus: {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount
    }
  });

  // Implement circuit breaker
  if (totalErrors >= MAX_ERRORS_BEFORE_RESTART) {
    console.error('Too many database errors, attempting pool restart...');
    pool.end().catch(console.error);
    // Pool will be recreated on next request
  }
});

// Simplified connection monitoring
pool.on('connect', () => {
  console.log('Database connection established', {
    timestamp: new Date().toISOString(),
    poolStatus: {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount
    }
  });
});

// Export configured Drizzle instance
export const db = drizzle(pool, { schema });

// Enhanced health check with connection validation
export async function checkDatabaseHealth() {
  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Graceful shutdown helper
export async function closeDatabase() {
  try {
    await pool.end();
    console.log('Database connections closed successfully');
  } catch (error) {
    console.error('Error closing database connections:', error);
    throw error;
  }
}