import express, { type Express } from "express";
import { createServer } from "http";
import { registerRoutes } from './routes';
import { setupVite } from './vite';
import { setupAuth } from './auth';
import { setupWebSocket } from './websocket';
import cors from 'cors';
import { portManager } from './port-manager';

async function startServer() {
  const app = express();
  const isProduction = process.env.NODE_ENV === 'production';

  // Enhanced CORS configuration for WebSocket support
  app.use(cors({
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400 // 24 hours
  }));

  // Serve static files with enhanced caching and error handling
  app.use('/placeholders', express.static('client/public/placeholders', {
    maxAge: '1d',
    immutable: true,
    etag: true,
    lastModified: true,
    fallthrough: false, // Return 404 for missing files
    redirect: false // Don't redirect on trailing slash
  }));

  app.use(express.json());

  // Create HTTP server
  const server = createServer(app);

  // Health check endpoint with enhanced diagnostics
  app.get('/api/health', (_req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: Date.now(),
      websocket: 'enabled',
      environment: process.env.NODE_ENV,
      staticFiles: {
        placeholdersPath: 'client/public/placeholders',
        caching: true
      }
    });
  });

  try {
    console.log('Starting server initialization...');

    // Release all ports with retries
    let releaseAttempts = 0;
    const maxReleaseAttempts = 3;

    while (releaseAttempts < maxReleaseAttempts) {
      try {
        await portManager.releaseAll();
        console.log('Released all ports successfully');
        break;
      } catch (error) {
        releaseAttempts++;
        console.error(`Port release attempt ${releaseAttempts} failed:`, error);
        if (releaseAttempts < maxReleaseAttempts) {
          await new Promise(resolve => setTimeout(resolve, 2000 * releaseAttempts));
        } else {
          throw new Error('Failed to release ports after multiple attempts');
        }
      }
    }

    // Increased delay for proper port cleanup
    await new Promise(resolve => setTimeout(resolve, 3000));

    const port = 5000;
    console.log(`Attempting to acquire port ${port}...`);

    // Port acquisition with retries
    let acquireAttempts = 0;
    const maxAcquireAttempts = 3;

    while (acquireAttempts < maxAcquireAttempts) {
      try {
        await portManager.acquirePort(port, port);
        console.log(`Successfully acquired port ${port}`);
        break;
      } catch (error) {
        acquireAttempts++;
        console.error(`Port acquisition attempt ${acquireAttempts} failed:`, error);
        if (acquireAttempts < maxAcquireAttempts) {
          await new Promise(resolve => setTimeout(resolve, 2000 * acquireAttempts));
        } else {
          throw new Error('Failed to acquire port after multiple attempts');
        }
      }
    }

    // Setup authentication with proper session configuration
    const sessionMiddleware = await setupAuth(app);
    console.log('Authentication setup complete');

    // Setup WebSocket with enhanced error handling
    let wsSetupRetries = 0;
    const maxRetries = 5;
    let wss;

    while (wsSetupRetries < maxRetries) {
      try {
        wss = await setupWebSocket(server, sessionMiddleware);
        console.log('WebSocket setup complete');
        break;
      } catch (error) {
        wsSetupRetries++;
        console.error(`WebSocket setup attempt ${wsSetupRetries} failed:`, error);
        if (wsSetupRetries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 2000 * wsSetupRetries));
        }
      }
    }

    if (!wss) {
      throw new Error('Failed to setup WebSocket after multiple attempts');
    }

    // Setup routes after WebSocket is ready
    await registerRoutes(app);
    console.log('Routes registered');

    // Setup Vite with WebSocket configuration
    await setupVite(app, server);
    console.log('Vite setup complete');

    // Bind to all interfaces with proper error handling
    await new Promise<void>((resolve, reject) => {
      server.listen(port, '0.0.0.0', () => {
        console.log(`Server running at http://0.0.0.0:${port}`);
        console.log(`Environment: ${process.env.NODE_ENV}`);
        console.log(`WebSocket endpoint: ws://0.0.0.0:${port}/ws`);
        resolve();
      }).on('error', (error) => {
        reject(error);
      });
    });

    // Enhanced cleanup handling
    const cleanup = async () => {
      console.log('Starting cleanup process...');

      try {
        if (wss) {
          await new Promise<void>((resolve) => {
            wss.clients.forEach((client) => {
              client.close(1000, 'Server shutting down');
            });
            wss.close(() => {
              console.log('WebSocket server closed');
              resolve();
            });
          });
        }

        await new Promise<void>((resolve) => {
          server.close(() => {
            console.log('HTTP server closed');
            resolve();
          });
        });

        await portManager.releaseAll();
        console.log('Ports released');

      } catch (error) {
        console.error('Error during cleanup:', error);
      }

      process.exit(0);
    };

    process.on('SIGTERM', cleanup);
    process.on('SIGINT', cleanup);

  } catch (error) {
    console.error('Failed to start server:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }

    try {
      await portManager.releaseAll();
    } catch (cleanupError) {
      console.error('Failed to cleanup ports:', cleanupError);
    }

    process.exit(1);
  }
}

// Add error handling for unhandled rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

startServer().catch(error => {
  console.error('Unhandled error during server startup:', error);
  process.exit(1);
});