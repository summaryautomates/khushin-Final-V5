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
  const REQUIRED_PORT = 5000;

  try {
    console.log('Starting server initialization...', {
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      requiredPort: REQUIRED_PORT
    });

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

    console.log('Starting port management...');
    let releaseAttempts = 0;
    const maxReleaseAttempts = 3;

    while (releaseAttempts < maxReleaseAttempts) {
      try {
        await portManager.releaseAll();
        console.log('Released all ports successfully');
        break;
      } catch (error) {
        releaseAttempts++;
        console.error('Port release attempt failed:', {
          attempt: releaseAttempts,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString()
        });
        if (releaseAttempts < maxReleaseAttempts) {
          await new Promise(resolve => setTimeout(resolve, 2000 * releaseAttempts));
        } else {
          throw new Error('Failed to release ports after multiple attempts');
        }
      }
    }

    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log(`Testing availability of required port ${REQUIRED_PORT}...`);

    try {
      await portManager.testPort(REQUIRED_PORT);
      console.log(`Port ${REQUIRED_PORT} is available`);
    } catch (error) {
      console.error(`Port ${REQUIRED_PORT} is not available:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      throw new Error(`Required port ${REQUIRED_PORT} is not available. Please ensure no other processes are using this port.`);
    }

    const port = await portManager.acquirePort(REQUIRED_PORT, REQUIRED_PORT);
    if (port !== REQUIRED_PORT) {
      throw new Error(`Failed to acquire required port ${REQUIRED_PORT}. Got port ${port} instead.`);
    }
    console.log(`Successfully acquired required port ${port}`);

    console.log('Setting up authentication...');
    const sessionMiddleware = await setupAuth(app);
    console.log('Authentication setup complete');

    console.log('Setting up WebSocket...');
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
        console.error('WebSocket setup failed:', {
          attempt: wsSetupRetries,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString()
        });
        if (wsSetupRetries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 2000 * wsSetupRetries));
        } else {
          throw new Error('Failed to setup WebSocket after multiple attempts');
        }
      }
    }

    if (!wss) {
      throw new Error('Failed to setup WebSocket after multiple attempts');
    }

    console.log('Registering routes...');
    await registerRoutes(app);
    console.log('Routes registered');

    console.log('Setting up Vite...');
    await setupVite(app, server);
    console.log('Vite setup complete');

    await new Promise<void>((resolve, reject) => {
      server.listen(port, '0.0.0.0', () => {
        console.log('Server successfully started:', {
          url: `http://0.0.0.0:${port}`,
          environment: process.env.NODE_ENV,
          websocketEndpoint: `ws://0.0.0.0:${port}/ws`,
          timestamp: new Date().toISOString()
        });
        resolve();
      }).on('error', (error) => {
        console.error('Server listen error:', {
          port: REQUIRED_PORT,
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        });
        reject(error);
      });
    });

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

  } catch (error) {
    console.error('Server startup failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });

    try {
      await portManager.releaseAll();
      console.log('Ports released after startup failure');
    } catch (cleanupError) {
      console.error('Failed to cleanup ports:', {
        error: cleanupError instanceof Error ? cleanupError.message : 'Unknown error',
        stack: cleanupError instanceof Error ? cleanupError.stack : undefined,
        timestamp: new Date().toISOString()
      });
    }

    process.exit(1);
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