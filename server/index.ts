import express, { type Express } from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger } from "vite";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

const app = express();

// Basic middleware
app.use(express.json());

// Simple static file serving for GLB files
app.use('/attached_assets', express.static('attached_assets', {
  setHeaders: (res, filepath) => {
    if (filepath.endsWith('.glb')) {
      res.setHeader('Content-Type', 'model/gltf-binary');
    }
  }
}));

// Basic health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Basic request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`, 'server');
  });
  next();
});

// Cleanup function to ensure proper server shutdown
const cleanup = (server: Server | null) => {
  if (server) {
    server.removeAllListeners();
    if (server.listening) {
      server.close(() => {
        console.log('Server closed successfully');
      });
    }
  }
};

// Try to bind to a port with retries
const tryBindPort = async (server: Server, port: number, retries = 3): Promise<boolean> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          cleanup(server);
          reject(new Error(`Port binding timeout on port ${port}`));
        }, 5000);

        server.once('error', (err: NodeJS.ErrnoException) => {
          clearTimeout(timeoutId);
          if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} in use (attempt ${attempt}/${retries}), retrying...`);
            cleanup(server);
            resolve(); // Allow retry
          } else {
            reject(err);
          }
        });

        server.listen(port, '0.0.0.0', () => {
          clearTimeout(timeoutId);
          resolve();
        });
      });

      // If we get here, binding succeeded
      return true;
    } catch (error) {
      if (attempt === retries) {
        console.error(`Failed to bind to port ${port} after ${retries} attempts:`, error);
        return false;
      }
      // Wait briefly before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return false;
};

// Start server with environment-aware port binding and fallback
const startServer = async () => {
  try {
    log('Starting server...', 'server');

    // Explicitly set PORT for workflow compatibility
    const targetPort = 5000;
    process.env.PORT = targetPort.toString();

    // Log environment details
    console.log('Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      HOST: process.env.HOST
    });

    // Register routes first
    console.log('Registering routes...');
    const server = await import("./routes.ts").then(m => m.registerRoutes(app));
    console.log('Routes registered successfully');

    // Attempt to bind to the target port
    console.log(`Attempting to bind to port ${targetPort}...`);
    const bound = await tryBindPort(server, targetPort);

    if (!bound) {
      console.error(`Failed to bind to port ${targetPort}`);
      process.exit(1);
    }

    // Only try to access server.address() after confirming successful binding
    const address = server.address();
    if (!address || typeof address === 'string') {
      throw new Error('Invalid server address');
    }

    console.log(`Server bound successfully to port ${address.port}`);
    log(`Server successfully bound to port ${address.port}`, 'server');

    log(`Server started in ${process.env.NODE_ENV || 'development'} mode`, 'server');

    // Setup Vite or serve static files
    if (process.env.NODE_ENV !== 'production') {
      console.log('Setting up Vite middleware...');
      const { setupVite } = await import("./vite.ts");
      await setupVite(app, server)
        .then(() => log('Vite setup complete', 'server'))
        .catch(error => {
          console.error('Vite setup error:', error);
          throw error;
        });
    } else {
      const { serveStatic } = await import("./vite.ts");
      serveStatic(app);
    }

    // Graceful shutdown handlers
    const shutdownHandler = () => {
      log('Shutting down gracefully...', 'server');
      cleanup(server);
      process.exit(0);
    };

    process.on('SIGTERM', shutdownHandler);
    process.on('SIGINT', shutdownHandler);

  } catch (error) {
    console.error('Critical server error:', error);
    log(`Critical server error: ${error}`, 'server');
    process.exit(1);
  }
};

startServer();