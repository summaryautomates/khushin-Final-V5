import express from "express";
import { log } from "./vite";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { AddressInfo } from 'net';

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

// Start server with detailed logging and port fallback
const startServer = async () => {
  try {
    log('Starting server...', 'server');
    const preferredPort = 5000;
    const fallbackPorts = [5001, 5002, 5003, 5004];

    const server = await registerRoutes(app);

    // Try to bind to the preferred port first
    try {
      await new Promise((resolve, reject) => {
        server.listen(preferredPort, '0.0.0.0', () => {
          const address = server.address() as AddressInfo;
          log(`Server successfully bound to preferred port ${address.port}`, 'server');
          resolve(true);
        }).on('error', (err) => {
          log(`Could not bind to preferred port ${preferredPort}, trying fallback ports`, 'server');
          reject(err);
        });
      });
    } catch (error) {
      // If preferred port fails, try fallback ports
      let bound = false;
      for (const port of fallbackPorts) {
        try {
          await new Promise((resolve, reject) => {
            server.listen(port, '0.0.0.0', () => {
              const address = server.address() as AddressInfo;
              log(`Server successfully bound to fallback port ${address.port}`, 'server');
              bound = true;
              resolve(true);
            }).on('error', reject);
          });
          if (bound) break;
        } catch (error) {
          log(`Failed to bind to port ${port}, trying next port`, 'server');
          continue;
        }
      }

      if (!bound) {
        throw new Error('No available ports found');
      }
    }

    log(`Server started in ${process.env.NODE_ENV || 'development'} mode`, 'server');

    // Setup Vite after server is running
    if (process.env.NODE_ENV !== 'production') {
      setupVite(app, server)
        .then(() => log('Vite setup complete', 'server'))
        .catch(error => {
          log(`Vite setup error: ${error}`, 'server');
          process.exit(1);
        });
    } else {
      serveStatic(app);
    }
  } catch (error) {
    log(`Critical server error: ${error}`, 'server');
    process.exit(1);
  }
};

// Add process handlers for cleanup
process.on('SIGTERM', () => {
  log('SIGTERM received. Shutting down gracefully...', 'server');
  process.exit(0);
});

process.on('SIGINT', () => {
  log('SIGINT received. Shutting down gracefully...', 'server');
  process.exit(0);
});

startServer();