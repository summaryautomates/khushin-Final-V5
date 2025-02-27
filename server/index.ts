import express, { type Express } from "express";
import { createServer } from "http";
import { registerRoutes } from './routes';
import { setupVite } from './vite';
import { setupAuth } from './auth';
import { setupWebSocket } from './websocket';
import cors from 'cors';
import { portManager } from './port-manager';
import { db, checkDatabaseHealth } from './db';

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

    // Verify database connection first
    console.log('Checking database health...');
    try {
      const isHealthy = await checkDatabaseHealth();
      if (!isHealthy) {
        throw new Error('Database health check failed');
      }
      console.log('Database health check passed');
    } catch (dbError) {
      console.error('Database initialization failed:', {
        error: dbError instanceof Error ? dbError.message : 'Unknown error',
        stack: dbError instanceof Error ? dbError.stack : undefined,
        timestamp: new Date().toISOString()
      });
      throw new Error('Failed to initialize database');
    }

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
      const port = await portManager.acquirePort(REQUIRED_PORT, REQUIRED_PORT);
      if (port !== REQUIRED_PORT) {
        throw new Error(`Failed to acquire required port ${REQUIRED_PORT}. Got port ${port} instead.`);
      }
      console.log(`Successfully acquired required port ${port}`);
    } catch (error) {
      console.error(`Port ${REQUIRED_PORT} acquisition failed:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      throw new Error(`Required port ${REQUIRED_PORT} is not available. Please ensure no other processes are using this port.`);
    }

    console.log('Setting up authentication...');
    let sessionMiddleware;
    try {
      sessionMiddleware = await setupAuth(app);
      console.log('Authentication setup complete');
    } catch (authError) {
      console.error('Authentication setup failed:', {
        error: authError instanceof Error ? authError.message : 'Unknown error',
        stack: authError instanceof Error ? authError.stack : undefined,
        timestamp: new Date().toISOString()
      });
      throw new Error('Failed to setup authentication');
    }

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
    try {
      await registerRoutes(app);
      console.log('Routes registered successfully');
    } catch (routeError) {
      console.error('Route registration failed:', {
        error: routeError instanceof Error ? routeError.message : 'Unknown error',
        stack: routeError instanceof Error ? routeError.stack : undefined,
        timestamp: new Date().toISOString()
      });
      throw new Error('Failed to register routes');
    }

    console.log('Setting up Vite...');
    try {
      await setupVite(app, server);
      console.log('Vite setup complete');
    } catch (viteError) {
      console.error('Vite setup failed:', {
        error: viteError instanceof Error ? viteError.message : 'Unknown error',
        stack: viteError instanceof Error ? viteError.stack : undefined,
        timestamp: new Date().toISOString()
      });
      throw new Error('Failed to setup Vite');
    }

    await new Promise<void>((resolve, reject) => {
      server.listen(REQUIRED_PORT, '0.0.0.0', () => {
        console.log('Server successfully started:', {
          url: `http://0.0.0.0:${REQUIRED_PORT}`,
          environment: process.env.NODE_ENV,
          websocketEndpoint: `ws://0.0.0.0:${REQUIRED_PORT}/ws`,
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
      timestamp: new Date().toISOString(),
      // Additional diagnostic information
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        // Add other relevant env vars, but exclude sensitive ones
      }
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
    timestamp: new Date().toISOString(),
    // Additional diagnostic information
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch
  });
  process.exit(1);
});

startServer().catch(error => {
  console.error('Unhandled error during server startup:', {
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
    // Additional diagnostic information
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch
  });
  process.exit(1);
});