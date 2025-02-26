import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;
neonConfig.wsProxy = (url) => url; // Direct WebSocket connection
neonConfig.pipelineConnect = false; // Disable pipelining to prevent connection issues

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure pool with optimized settings and better error handling
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000, // Increased timeout
  max: 3, // Reduced pool size for better stability
  idleTimeoutMillis: 30000, // Increased idle timeout
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  retryInterval: 1000, // Add retry interval
  maxRetries: 3 // Add max retries
});

// Enhanced error handling with detailed logging
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', {
    error: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
    poolStatus: {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount
    }
  });
});

// Connection monitoring with detailed status
pool.on('connect', (client) => {
  console.log('New database connection established', {
    timestamp: new Date().toISOString(),
    clientId: client?.processID,
    poolStatus: {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount
    }
  });
});

pool.on('acquire', () => {
  console.log('Connection acquired from pool', {
    timestamp: new Date().toISOString(),
    poolStatus: {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount
    }
  });
});

// Add connection release monitoring
pool.on('remove', () => {
  console.log('Connection removed from pool', {
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

// Add health check function
export async function checkDatabaseHealth() {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}