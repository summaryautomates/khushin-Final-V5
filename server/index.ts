import express from "express";
import { log } from "./vite";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import path from 'path';
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
    const ports = [5000, 5001, 5002, 5003, 5004]; // List of ports to try
    const port = process.env.PORT || ports[0];

    const server = await registerRoutes(app);

    // Function to try binding to a port
    const tryPort = (portNumber: number): Promise<boolean> => {
      return new Promise((resolve) => {
        const tempServer = server.listen(portNumber, '0.0.0.0', () => {
          tempServer.close(() => resolve(true));
        }).on('error', () => resolve(false));
      });
    };

    // Try ports sequentially until one works
    let selectedPort = port;
    if (typeof port === 'string') {
      selectedPort = parseInt(port, 10);
    }

    let portFound = await tryPort(selectedPort);
    if (!portFound && !process.env.PORT) {
      for (const fallbackPort of ports.slice(1)) {
        portFound = await tryPort(fallbackPort);
        if (portFound) {
          selectedPort = fallbackPort;
          break;
        }
      }
    }

    if (!portFound) {
      throw new Error('No available ports found');
    }

    server.listen(selectedPort, '0.0.0.0', () => {
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