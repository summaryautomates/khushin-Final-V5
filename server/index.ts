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

// Performance monitoring middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      console.log(
        `${req.method} ${req.path} ${res.statusCode} in ${duration}ms`
      );
    }
  });
  next();
});

// Performance monitoring (retained from original, but simplified)
const performanceMetrics = {
  startTime: Date.now(),
  slowRequests: [] as Array<{path: string, duration: number, timestamp: number}>,
  requestCount: 0,
  totalResponseTime: 0
};

// Performance metrics endpoint (retained from original)
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

// Test route (retained from original)
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

const startServer = async () => {
  try {
    const port = parseInt(process.env.PORT || '5001', 10);
    const server = createServer(app);

    await new Promise<void>((resolve) => {
      server.listen(port, '0.0.0.0', () => {
        console.log(`Server listening on port ${port}`);
        resolve();
      });
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('Setting up Vite...');
      await setupVite(app, server);
    } else {
      console.log('Setting up static file serving...');
      serveStatic(app);
    }
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();