import express from "express";
import { log } from "./vite";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { AddressInfo } from 'net';
import { Server } from 'http';

// Add process-level error handlers
process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

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
      server.close();
    }
  }
};

// Start server with environment-aware port binding and fallback
const startServer = async () => {
  try {
    log('Starting server...', 'server');

    // Log environment details
    console.log('Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      HOST: process.env.HOST
    });

    // Prioritize environment PORT, then try alternative ports
    const portToTry = process.env.PORT ? [parseInt(process.env.PORT, 10)] : [5000, 3000, 3001, 5001];
    let server: Server | null = null;
    let boundPort: number | null = null;

    try {
      // Register routes first
      console.log('Registering routes...');
      server = await registerRoutes(app);
      console.log('Routes registered successfully');
    } catch (error) {
      console.error('Failed to register routes:', error);
      throw error;
    }

    // Try ports sequentially
    for (const port of portToTry) {
      try {
        await new Promise<void>((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            cleanup(server);
            reject(new Error(`Port binding timeout on port ${port}`));
          }, 10000);

          server!.listen(port, '0.0.0.0', async () => {
            clearTimeout(timeoutId);
            const address = server!.address() as AddressInfo;
            boundPort = port;
            console.log(`Server bound successfully to port ${port}`);
            log(`Server successfully bound to port ${port}`, 'server');
            resolve();
          });

          server!.once('error', (err: NodeJS.ErrnoException) => {
            clearTimeout(timeoutId);
            console.error(`Failed to bind to port ${port}:`, err.message);
            if (err.code === 'EADDRINUSE') {
              // If this is the environment-specified port, we should fail
              if (process.env.PORT && port === parseInt(process.env.PORT, 10)) {
                cleanup(server);
                reject(new Error(`Environment-specified port ${port} is in use`));
              }
              // Otherwise, we'll try the next port
              resolve();
            } else {
              cleanup(server);
              reject(err);
            }
          });
        });

        // If we successfully bound to a port, break the loop
        if (boundPort) break;
      } catch (error) {
        // If this was the last port or an environment-specified port, throw
        if (process.env.PORT || port === portToTry[portToTry.length - 1]) {
          throw error;
        }
        // Otherwise continue to next port
        continue;
      }
    }

    if (!boundPort || !server) {
      throw new Error('Failed to bind to any available port');
    }

    log(`Server started in ${process.env.NODE_ENV || 'development'} mode`, 'server');

    // Setup Vite after server is running
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('Setting up Vite...');
        await setupVite(app, server)
          .then(() => log('Vite setup complete', 'server'))
          .catch(error => {
            console.error('Vite setup error:', error);
            cleanup(server);
            process.exit(1);
          });
      } catch (error) {
        console.error('Error during Vite setup:', error);
        throw error;
      }
    } else {
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