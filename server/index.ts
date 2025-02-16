import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import helmet from "helmet";
import cors from "cors";
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'http';
import { AddressInfo } from 'net';

// Basic Express setup with minimal middleware
const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Performance monitoring middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`, 'server');
    }
  });
  next();
});

// Performance metrics
const performanceMetrics = {
  startTime: Date.now(),
  slowRequests: [] as Array<{path: string, duration: number, timestamp: number}>,
  requestCount: 0,
  totalResponseTime: 0
};

// Performance metrics endpoint
app.get('/api/metrics', (_req, res) => {
  const uptime = Date.now() - performanceMetrics.startTime;
  const avgResponseTime = performanceMetrics.requestCount > 0 
    ? performanceMetrics.totalResponseTime / performanceMetrics.requestCount 
    : 0;

  res.json({
    uptime,
    requestCount: performanceMetrics.requestCount,
    avgResponseTime,
    slowRequests: performanceMetrics.slowRequests.slice(-10),
    memory: process.memoryUsage()
  });
});

// Health check route
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: Date.now(),
    uptime: Date.now() - performanceMetrics.startTime
  });
});

// Register API routes
registerRoutes(app);

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const startServer = async () => {
  const PRIMARY_PORT = 5000;
  const FALLBACK_PORTS = [5001, 5002, 5003, 5004];
  const RETRY_DELAY = 1000;
  const MAX_RETRIES = 3;

  // First, try to start on the primary port
  for (let retry = 0; retry < MAX_RETRIES; retry++) {
    try {
      log(`Attempting to start server on primary port ${PRIMARY_PORT}...`, 'server');
      const server = createServer(app);

      await new Promise<void>((resolve, reject) => {
        const onError = (error: Error & { code?: string }) => {
          server.removeListener('listening', onListening);
          reject(error);
        };

        const onListening = () => {
          server.removeListener('error', onError);
          const address = server.address() as AddressInfo;
          log(`Server is running on port ${address.port}`, 'server');
          resolve();
        };

        server.once('error', onError);
        server.once('listening', onListening);

        server.listen(PRIMARY_PORT, '0.0.0.0');
      });

      // Setup graceful shutdown
      const shutdown = () => {
        log('Shutting down gracefully...', 'server');
        server.close(() => {
          log('Server closed', 'server');
          process.exit(0);
        });
      };

      process.on('SIGTERM', shutdown);
      process.on('SIGINT', shutdown);

      // Setup Vite after server is running
      if (process.env.NODE_ENV !== 'production') {
        log('Setting up Vite development environment...', 'server');
        try {
          await setupVite(app, server);
          log('Vite setup completed successfully', 'server');
        } catch (error) {
          log(`Vite setup failed: ${error}`, 'server');
          log('Falling back to static serving...', 'server');
          serveStatic(app);
        }
      } else {
        log('Setting up static file serving for production...', 'server');
        serveStatic(app);
      }

      return; // Server started successfully
    } catch (err: any) {
      if (err.code === 'EADDRINUSE') {
        if (retry === MAX_RETRIES - 1) {
          // If we've exhausted retries on primary port, try fallback ports
          log(`Unable to bind to primary port ${PRIMARY_PORT} after ${MAX_RETRIES} attempts, trying fallback ports...`, 'server');
          break;
        }
        log(`Port ${PRIMARY_PORT} is in use, retrying in ${RETRY_DELAY}ms...`, 'server');
        await sleep(RETRY_DELAY);
      } else {
        console.error('Failed to start server:', err);
        process.exit(1);
      }
    }
  }

  // If primary port fails, try fallback ports
  for (const port of FALLBACK_PORTS) {
    try {
      log(`Attempting to start server on fallback port ${port}...`, 'server');
      const server = createServer(app);

      await new Promise<void>((resolve, reject) => {
        server.once('error', reject);
        server.once('listening', () => {
          const address = server.address() as AddressInfo;
          log(`Server is running on fallback port ${address.port}`, 'server');
          resolve();
        });
        server.listen(port, '0.0.0.0');
      });

      // Setup Vite
      if (process.env.NODE_ENV !== 'production') {
        await setupVite(app, server);
      } else {
        serveStatic(app);
      }

      return; // Server started successfully on fallback port
    } catch (err: any) {
      if (err.code === 'EADDRINUSE') {
        log(`Fallback port ${port} is in use, trying next port...`, 'server');
        continue;
      }
      console.error(`Failed to start server on fallback port ${port}:`, err);
    }
  }

  // If we get here, all ports failed
  console.error('Failed to start server on any available port');
  process.exit(1);
};

startServer();