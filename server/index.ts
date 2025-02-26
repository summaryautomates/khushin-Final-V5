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
  app.use(express.json());

  // Create HTTP server
  const server = createServer(app);

  // CORS configuration with credentials support
  app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  }));

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  try {
    // Diagnostic: Log current port status
    console.log('Starting server initialization...');

    // Release any existing ports to ensure clean state
    await portManager.releaseAll();
    console.log('Released all ports');

    // Wait a bit for any cleanup to complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Always try to acquire port 5000 as required
    const port = 5000;
    console.log(`Attempting to acquire port ${port}...`);
    await portManager.acquirePort(port, port);
    console.log(`Successfully acquired port ${port}`);

    // Setup authentication and get session middleware
    const sessionMiddleware = await setupAuth(app);
    console.log('Authentication setup complete');

    // Setup WebSocket after authentication
    const wss = await setupWebSocket(server, sessionMiddleware);
    console.log('WebSocket setup complete');

    // Setup routes
    await registerRoutes(app);
    console.log('Routes registered');

    // Setup Vite last to ensure all middleware is properly initialized
    await setupVite(app, server);
    console.log('Vite setup complete');

    server.listen(port, '0.0.0.0', () => {
      console.log(`Server running at http://0.0.0.0:${port}`);
    });

    // Enhanced cleanup handling
    const cleanup = async () => {
      console.log('Starting cleanup process...');

      try {
        // Close WebSocket connections first
        await new Promise<void>((resolve) => {
          wss.close(() => {
            console.log('WebSocket server closed');
            resolve();
          });
        });

        // Then close the HTTP server
        await new Promise<void>((resolve) => {
          server.close(() => {
            console.log('HTTP server closed');
            resolve();
          });
        });

        // Release the port
        await portManager.releaseAll();
        console.log('Ports released');

      } catch (error) {
        console.error('Error during cleanup:', error);
      }

      process.exit(0);
    };

    // Setup signal handlers with async cleanup
    process.on('SIGTERM', cleanup);
    process.on('SIGINT', cleanup);

  } catch (error) {
    console.error('Failed to start server:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }

    // Attempt final cleanup before exit
    await portManager.releaseAll();
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