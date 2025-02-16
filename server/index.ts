import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import helmet from "helmet";
import cors from "cors";
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';

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


// Enhanced performance monitoring middleware
app.use((req, res, next) => {
  const start = Date.now();
  const originalEnd = res.end;
  const originalWrite = res.write;
  let bytesWritten = 0;

  // Track response size
  res.write = function(chunk: any) {
    if (chunk) {
      bytesWritten += chunk.length;
    }
    return originalWrite.apply(res, arguments as any);
  };

  res.end = function(chunk: any) {
    if (chunk) {
      bytesWritten += chunk.length;
    }
    const duration = Date.now() - start;

    // Update performance metrics
    performanceMetrics.requestCount++;
    performanceMetrics.totalResponseTime += duration;

    // Track slow requests (over 1000ms)
    if (duration > 1000) {
      performanceMetrics.slowRequests.push({
        path: req.path,
        duration,
        timestamp: Date.now()
      });
      // Keep only last 100 slow requests
      if (performanceMetrics.slowRequests.length > 100) {
        performanceMetrics.slowRequests.shift();
      }
    }

    if (req.path.startsWith("/api")) {
      const memoryUsage = process.memoryUsage();
      console.log(
        `${req.method} ${req.path} ${res.statusCode} ${bytesWritten}b in ${duration}ms`,
        `(heap: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB)`
      );
    }
    return originalEnd.apply(res, arguments as any);
  };

  next();
});

// Performance monitoring
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
    slowRequests: performanceMetrics.slowRequests.slice(-10), // Last 10 slow requests
    memory: process.memoryUsage()
  });
});

// Test route
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

// Create HTTP server
const findAvailablePort = async (startPort: number, maxAttempts = 5): Promise<number> => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const port = startPort + attempt;
    console.log(`Attempting to bind to port ${port}...`);

    // Create a new server instance for each attempt
    const testServer = createServer(app);

    try {
      await new Promise<number>((resolve, reject) => {
        const onError = (err: any) => {
          if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is in use`);
            testServer.close();
            resolve(-1);
          } else {
            reject(err);
          }
        };

        const onListening = () => {
          console.log(`Successfully bound to port ${port}`);
          testServer.close(() => resolve(port));
        };

        testServer.once('error', onError);
        testServer.once('listening', onListening);

        console.log(`Binding to port ${port}...`);
        testServer.listen(port, '0.0.0.0');
      });

      if (port !== -1) {
        return port;
      }
    } catch (err) {
      console.error(`Error trying port ${port}:`, err);
      if (attempt === maxAttempts - 1) throw err;
    }
  }
  throw new Error('Could not find an available port');
};

const startServer = async () => {
  try {
    console.time('Server startup');

    console.time('Route registration');
    await registerRoutes(app);
    console.timeEnd('Route registration');

    const startPort = parseInt(process.env.PORT || '5001', 10);
    console.log('Finding available port starting from', startPort);
    const port = await findAvailablePort(startPort);

    const server = createServer(app);

    // Start the server with the found port
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.once('listening', () => {
        console.log(`Server bound to port ${port}`);
        console.timeEnd('Server startup');
        resolve();
      });
      server.listen(port, '0.0.0.0');
    });

    // Setup Vite after server is running
    if (app.get("env") === "development") {
      console.log('Setting up Vite integration...');
      console.time('Vite setup');
      await setupVite(app, server);
      console.timeEnd('Vite setup');
    } else {
      console.log('Setting up static file serving...');
      console.time('Static setup');
      serveStatic(app);
      console.timeEnd('Static setup');
    }

  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();