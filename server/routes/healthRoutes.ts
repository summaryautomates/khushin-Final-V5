import type { Express } from "express";
import { db } from '../db';
import { sql } from 'drizzle-orm';

/**
 * Health check and server status routes
 */
export function healthRoutes(app: Express) {
  // Basic health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: Date.now(),
      websocket: 'enabled',
      environment: process.env.NODE_ENV
    });
  });

  // Extended health check with database status
  app.get('/api/health/detailed', async (_req, res) => {
    try {
      // Test database connection
      const dbConnectionStart = Date.now();
      const dbResult = await db.execute(sql`SELECT 1 as health_check`);
      const dbConnectionTime = Date.now() - dbConnectionStart;
      
      res.json({
        status: 'ok',
        timestamp: Date.now(),
        database: {
          connected: true,
          responseTime: `${dbConnectionTime}ms`,
        },
        server: {
          environment: process.env.NODE_ENV,
          uptime: process.uptime(),
          memory: process.memoryUsage(),
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        timestamp: Date.now(),
        database: {
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown database error',
        },
        server: {
          environment: process.env.NODE_ENV,
          uptime: process.uptime(),
          memory: process.memoryUsage(),
        }
      });
    }
  });
}