import express from "express";
import { log } from "./vite";
import { AddressInfo } from 'net';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import path from 'path';

const app = express();

// Only essential middleware
app.use(express.json());

// Configure static file serving for assets with detailed logging
app.use('/attached_assets', (req, res, next) => {
  log(`Static asset request: ${req.url}`, 'static');
  express.static('attached_assets', {
    setHeaders: (res, filepath) => {
      if (filepath.endsWith('.glb')) {
        res.setHeader('Content-Type', 'model/gltf-binary');
      }
    }
  })(req, res, next);
});

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
    const port = process.env.PORT || 5000; // Changed default port to 5000

    const server = await registerRoutes(app);

    // Add error handler for the server
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        log(`Port ${port} is already in use. Please try a different port.`, 'server');
        process.exit(1);
      } else {
        log(`Server error: ${error.message}`, 'server');
        process.exit(1);
      }
    });

    server.listen(port, '0.0.0.0', () => {
      const address = server.address() as AddressInfo;
      log(`Server successfully bound to port ${address.port}`, 'server');
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
    });

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