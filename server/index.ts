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
    console.log('Checking port availability...');

    // Release any existing ports to ensure clean state
    portManager.releaseAll();

    // Wait a bit for any cleanup to complete
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Always try to acquire port 5000 as required
    const port = 5000;
    console.log(`Attempting to acquire required port ${port}...`);
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
      portManager.releaseAll();
      console.log('Ports released');

      process.exit(0);
    };

    // Setup signal handlers with async cleanup
    process.on('SIGTERM', cleanup);
    process.on('SIGINT', cleanup);

  } catch (error) {
    console.error('Failed to start server:', error);
    console.error('Port 5000 is required but unavailable. Please ensure no other process is using port 5000.');

    // Attempt final cleanup before exit
    portManager.releaseAll();
    process.exit(1);
  }
}

startServer().catch(error => {
  console.error('Unhandled error during server startup:', error);
  process.exit(1);
});