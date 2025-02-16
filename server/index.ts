import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import helmet from "helmet";
import cors from "cors";
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';

const app = express();

// Basic Helmet configuration with minimal options
app.use(helmet({
  contentSecurityPolicy: false, // Temporarily disabled
  crossOriginEmbedderPolicy: false,
}));

// Cookie parser middleware
app.use(cookieParser());

// Session middleware with basic options
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Temporarily disabled for testing
    httpOnly: true,
  }
}));

// Simplified CORS
app.use(cors());

// Body parsing middleware with increased limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Basic request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    if (req.path.startsWith("/api")) {
      const duration = Date.now() - start;
      log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

const DEFAULT_PORT = 3333;
const httpPort = parseInt(process.env.PORT || DEFAULT_PORT.toString(), 10);

const startServer = async (port: number) => {
  const server = createServer(app);
  await registerRoutes(app);

  // Temporarily skip Vite setup for testing
  if (app.get("env") === "production") {
    serveStatic(app);
  }

  // Try to find an available port
  const tryPort = (attemptPort: number, maxAttempts = 10): Promise<void> => {
    return new Promise((resolve, reject) => {
      server.once('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          if (maxAttempts > 0) {
            log(`Port ${attemptPort} is in use, trying ${attemptPort + 1}`);
            tryPort(attemptPort + 1, maxAttempts - 1).then(resolve).catch(reject);
          } else {
            reject(new Error('Could not find an available port after maximum attempts'));
          }
        } else {
          reject(err);
        }
      });

      server.listen(attemptPort, "0.0.0.0", () => {
        log(`Server running on http://0.0.0.0:${attemptPort}`);
        resolve();
      });
    });
  };

  try {
    await tryPort(port);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

// Start HTTP server
startServer(httpPort).catch(err => {
  console.error('Failed to start application:', err);
  process.exit(1);
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  log(`Error: ${message}`);
});