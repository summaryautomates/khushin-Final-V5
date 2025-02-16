import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import helmet from "helmet";
import cors from "cors";
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'http';

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

const findAvailablePort = async (startPort: number, maxAttempts: number = 5): Promise<number> => {
  for (let port = startPort; port < startPort + maxAttempts; port++) {
    log(`Checking port ${port}...`, 'server');

    try {
      const server = createServer();
      const isAvailable = await new Promise<boolean>((resolve) => {
        server.once('error', (err: any) => {
          server.close();
          if (err.code === 'EADDRINUSE') {
            log(`Port ${port} is in use`, 'server');
            resolve(false);
          } else {
            log(`Error checking port ${port}: ${err.message}`, 'server');
            resolve(false);
          }
        });

        server.listen(port, '0.0.0.0', () => {
          server.close(() => {
            log(`Port ${port} is available`, 'server');
            resolve(true);
          });
        });
      });

      if (isAvailable) {
        return port;
      }
    } catch (err) {
      log(`Failed to check port ${port}: ${err}`, 'server');
    }
  }
  throw new Error(`No available ports found after ${maxAttempts} attempts starting from ${startPort}`);
};

const setupServer = async (port: number, server: Server) => {
  if (process.env.NODE_ENV !== 'production') {
    log('Setting up Vite...', 'server');
    try {
      // Set a timeout for Vite setup
      const viteSetupPromise = setupVite(app, server);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Vite setup timeout')), 30000);
      });

      await Promise.race([viteSetupPromise, timeoutPromise]);
      log('Vite setup completed successfully', 'server');
    } catch (error) {
      log(`Vite setup failed: ${error}`, 'server');
      // If Vite setup fails, fall back to static serving
      log('Falling back to static serving...', 'server');
      serveStatic(app);
    }
  } else {
    log('Setting up static file serving...', 'server');
    serveStatic(app);
  }
};

const startServer = async () => {
  try {
    const defaultPort = parseInt(process.env.PORT || '5001', 10);
    log(`Finding available port starting from ${defaultPort}...`, 'server');
    const port = await findAvailablePort(defaultPort);
    log(`Selected port ${port}`, 'server');

    const server = createServer(app);

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

    await new Promise<void>((resolve) => {
      server.listen(port, '0.0.0.0', () => {
        log(`Server listening on port ${port}`, 'server');
        resolve();
      });
    });

    // Setup server with timeout handling
    await setupServer(port, server);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();