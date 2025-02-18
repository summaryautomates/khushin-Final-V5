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

// Configure static file serving for assets
app.use('/attached_assets', express.static('attached_assets'));

// Start server with detailed logging and port fallback
const startServer = async () => {
  const tryPort = async (port: number): Promise<void> => {
    try {
      const server = await registerRoutes(app);

      await new Promise<void>((resolve, reject) => {
        server.once('error', (error: NodeJS.ErrnoException) => {
          if (error.code === 'EADDRINUSE') {
            log(`Port ${port} is in use, trying next port...`, 'server');
            reject(error);
          } else {
            log(`Server error: ${error.message}`, 'server');
            reject(error);
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
          resolve();
        });
      });
    } catch (error) {
      if (error && (error as NodeJS.ErrnoException).code === 'EADDRINUSE') {
        throw error; // Re-throw to try next port
      }
      log(`Failed to start server: ${error}`, 'server');
      process.exit(1);
    }
  };

  try {
    log('Starting server...', 'server');
    const configuredPort = process.env.PORT;
    log(`Configured PORT env var: ${configuredPort}`, 'server');

    const initialPort = Number(configuredPort) || 5000;
    const maxRetries = 3;

    for (let i = 0; i < maxRetries; i++) {
      const port = initialPort + i;
      try {
        log(`Attempting to start server on port ${port}...`, 'server');
        await tryPort(port);
        return; // Server started successfully
      } catch (error) {
        if (i === maxRetries - 1) {
          log(`Failed to bind to any port after ${maxRetries} attempts`, 'server');
          process.exit(1);
        }
      }
    }
  } catch (error) {
    log(`Critical server error: ${error}`, 'server');
    process.exit(1);
  }
};

startServer();