import express, { type Express } from "express";
import { createServer } from "http";
import { registerRoutes } from './routes';
import { setupVite } from './vite';
import { setupAuth } from './auth';
import { setupWebSocket } from './websocket';
import cors from 'cors';
import { portManager } from './port-manager';
import { db, checkDatabaseHealth } from './db';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function forceCleanupPort(port: number) {
  try {
    console.log(`Attempting to force cleanup port ${port}...`);
    // Try to kill any process using the port
    await execAsync(`fuser -k ${port}/tcp`);
    console.log(`Force cleanup of port ${port} completed`);
  } catch (error) {
    // If fuser fails, it likely means no process was using the port
    console.log(`No process found using port ${port}`);
  }
}

async function startServer() {
  const app = express();
  const isProduction = process.env.NODE_ENV === 'production';
  const REQUIRED_PORT = 5000;
  const MAX_STARTUP_RETRIES = 3;
  let startupAttempts = 0;

  while (startupAttempts < MAX_STARTUP_RETRIES) {
    try {
      console.log(`Starting server initialization (attempt ${startupAttempts + 1}/${MAX_STARTUP_RETRIES})...`, {
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        requiredPort: REQUIRED_PORT
      });

      // Force cleanup of the required port
      await forceCleanupPort(REQUIRED_PORT);

      // Release all ports managed by portManager
      console.log('Performing complete port cleanup...');
      await portManager.releaseAll();
      console.log('Complete port cleanup finished');

      // Wait a moment for ports to fully release
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify database connection
      console.log('Checking database health...');
      const isHealthy = await checkDatabaseHealth();
      if (!isHealthy) {
        throw new Error('Database health check failed');
      }
      console.log('Database health check passed');

      // Setup middleware
      app.use(cors({
        origin: true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With', 'Accept'],
        exposedHeaders: ['Set-Cookie'],
        maxAge: 86400
      }));
      console.log('CORS configuration applied');

      app.use('/placeholders', express.static('client/public/placeholders', {
        maxAge: '1d',
        immutable: true,
        etag: true,
        lastModified: true,
        fallthrough: false,
        redirect: false
      }));
      console.log('Static file serving configured');

      app.use(express.json());
      const server = createServer(app);

      // Health check endpoint
      app.get('/api/health', (_req, res) => {
        res.json({ 
          status: 'ok',
          timestamp: Date.now(),
          websocket: 'enabled',
          environment: process.env.NODE_ENV,
          port: REQUIRED_PORT,
          startupAttempt: startupAttempts + 1
        });
      });

      // Setup authentication
      console.log('Setting up authentication...');
      const sessionMiddleware = await setupAuth(app);
      console.log('Authentication setup complete');

      // Setup WebSocket
      console.log('Setting up WebSocket...');
      const wss = await setupWebSocket(server, sessionMiddleware);
      console.log('WebSocket setup complete');

      // Register routes
      console.log('Registering routes...');
      await registerRoutes(app);
      console.log('Routes registered successfully');

      // Setup Vite
      console.log('Setting up Vite...');
      await setupVite(app, server);
      console.log('Vite setup complete');

      // Attempt to acquire and bind to the required port
      console.log(`Attempting to acquire port ${REQUIRED_PORT}...`);
      const port = await portManager.acquirePort(REQUIRED_PORT, REQUIRED_PORT);

      if (port !== REQUIRED_PORT) {
        throw new Error(`Failed to acquire required port ${REQUIRED_PORT}. Got port ${port} instead.`);
      }

      // Start the server
      await new Promise<void>((resolve, reject) => {
        const serverInstance = server.listen(port, '0.0.0.0', () => {
          console.log('Server successfully started:', {
            url: `http://0.0.0.0:${port}`,
            environment: process.env.NODE_ENV,
            websocketEndpoint: `ws://0.0.0.0:${port}/ws`,
            timestamp: new Date().toISOString()
          });
          resolve();
        });

        serverInstance.on('error', async (error: NodeJS.ErrnoException) => {
          if (error.code === 'EADDRINUSE') {
            console.error(`Port ${port} is still in use, attempting force cleanup...`);
            try {
              await forceCleanupPort(port);
              reject(new Error(`Port ${port} was in use and has been force-cleaned`));
            } catch (cleanupError) {
              reject(new Error(`Failed to clean up port ${port}: ${cleanupError}`));
            }
          } else {
            reject(new Error(`Failed to start server: ${error.message}`));
          }
        });
      });

      // Setup cleanup handlers
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

          await forceCleanupPort(REQUIRED_PORT);
          await portManager.releaseAll();
          console.log('All ports released');
        } catch (error) {
          console.error('Cleanup error:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString()
          });
        }
        process.exit(0);
      };

      process.on('SIGTERM', cleanup);
      process.on('SIGINT', cleanup);

      // If we got here, server started successfully
      return;

    } catch (error) {
      startupAttempts++;
      console.error(`Server startup attempt ${startupAttempts} failed:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });

      // Release ports before retrying
      try {
        await forceCleanupPort(REQUIRED_PORT);
        await portManager.releaseAll();
        console.log('Ports released after failed attempt');
      } catch (cleanupError) {
        console.error('Failed to cleanup ports:', cleanupError);
      }

      // If we haven't exceeded max retries, wait before trying again
      if (startupAttempts < MAX_STARTUP_RETRIES) {
        const delay = startupAttempts * 2000; // Exponential backoff
        console.log(`Waiting ${delay}ms before next attempt...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('Server startup failed after maximum retry attempts');
        process.exit(1);
      }
    }
  }
}

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', {
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString()
  });
  process.exit(1);
});

startServer().catch(error => {
  console.error('Unhandled error during server startup:', {
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString()
  });
  process.exit(1);
});