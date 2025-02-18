import express from "express";
import { log } from "./vite";
import { AddressInfo } from 'net';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";

const app = express();

// Only essential middleware
app.use(express.json());

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

// Start server with detailed logging
const startServer = async () => {
  try {
    log('Starting server...', 'server');
    const port = 5000; // Using Replit's common port
    log(`Attempting to bind to port ${port}...`, 'server');

    const server = await registerRoutes(app);

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

    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        log(`Port ${port} is already in use. Please try a different port.`, 'server');
      } else {
        log(`Server error: ${error.message}`, 'server');
      }
      process.exit(1);
    });

  } catch (error) {
    log(`Failed to start server: ${error}`, 'server');
    process.exit(1);
  }
};

startServer();