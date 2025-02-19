import express from "express";
import { log } from "./vite";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { AddressInfo } from 'net';
import { Server } from 'http';

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

// Start server with improved port handling
const startServer = async () => {
  try {
    log('Starting server...', 'server');

    // Restore port 5000 as first option
    const ports = [5000, 3000, 3001, 5001, 5002];
    let server: Server | null = null;
    let boundPort: number | null = null;

    // Register routes first
    server = await registerRoutes(app);

    // Try each port sequentially with proper cleanup
    for (const port of ports) {
      try {
        // Clean up any existing connections
        cleanup(server);

        await new Promise<void>((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            cleanup(server);
            reject(new Error(`Port binding timeout on port ${port}`));
          }, 10000); // Increased timeout to 10 seconds

          server!.listen(port, '0.0.0.0', async () => {
  if (process.env.NODE_ENV !== 'production') {
    // Allow Vite HMR connections
    app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      next();
    });
  } // Modified to use 0.0.0.0
            clearTimeout(timeoutId);
            const address = server!.address() as AddressInfo;
            boundPort = address.port;
            log(`Server successfully bound to port ${boundPort}`, 'server');
            resolve();
          });

          server!.once('error', (err: NodeJS.ErrnoException) => {
            clearTimeout(timeoutId);
            if (err.code === 'EADDRINUSE') {
              log(`Port ${port} is in use, trying next port...`, 'server');
              cleanup(server);
              reject(err);
            } else {
              log(`Unexpected error while binding to port ${port}: ${err.message}`, 'server');
              cleanup(server);
              reject(err);
            }
          });
        });

        // If we get here, we successfully bound to a port
        break;
      } catch (error) {
        const isLastPort = ports.indexOf(port) === ports.length - 1;
        log(`Failed to bind to port ${port}${isLastPort ? '' : ', trying next port...'}`, 'server');

        if (isLastPort) {
          throw new Error('All ports are in use, cannot start server');
        }
        // Continue to next port
        continue;
      }
    }

    if (!boundPort || !server) {
      throw new Error('Failed to start server on any port');
    }

    log(`Server started in ${process.env.NODE_ENV || 'development'} mode`, 'server');

    // Setup Vite after server is running
    if (process.env.NODE_ENV !== 'production') {
      await setupVite(app, server)
        .then(() => log('Vite setup complete', 'server'))
        .catch(error => {
          log(`Vite setup error: ${error}`, 'server');
          cleanup(server);
          process.exit(1);
        });
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
    log(`Critical server error: ${error}`, 'server');
    process.exit(1);
  }
};

startServer();