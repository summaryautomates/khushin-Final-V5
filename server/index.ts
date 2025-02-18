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

// Start server with detailed logging and port fallback
const startServer = async () => {
  try {
    log('Starting server...', 'server');

    // Define ports to try in order
    const ports = [5000, 3000, 3001, 5001, 5002];
    let server: Server | undefined;
    let bound = false;

    // Try each port in sequence
    for (const port of ports) {
      try {
        server = await registerRoutes(app);
        await new Promise<void>((resolve, reject) => {
          server!.listen(port, '0.0.0.0', () => {
            const address = server!.address() as AddressInfo;
            log(`Server successfully started on port ${address.port}`, 'server');
            bound = true;
            resolve();
          }).on('error', (err: Error) => {
            log(`Could not bind to port ${port}, trying next port`, 'server');
            reject(err);
          });
        });
        if (bound) break;
      } catch (error) {
        if (ports.indexOf(port) === ports.length - 1) {
          throw new Error('No available ports found');
        }
        continue;
      }
    }

    if (!bound || !server) {
      throw new Error('Failed to start server on any port');
    }

    log(`Server started in ${process.env.NODE_ENV || 'development'} mode`, 'server');

    // Setup Vite after server is running
    if (process.env.NODE_ENV !== 'production') {
      await setupVite(app, server)
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