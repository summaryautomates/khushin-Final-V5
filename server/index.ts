import express, { type Express } from "express";
import { createServer } from "http";
import { registerRoutes } from './routes/index';
import { setupVite } from './vite';
import { setupAuth } from './auth';
import { setupWebSocket } from './websocket';
import cors from 'cors';
import { portManager } from './port-manager';
import { checkDatabaseHealth } from './db';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import WebSocket from 'ws';

const __dirname = dirname(fileURLToPath(import.meta.url));

const execAsync = promisify(exec);

async function forceCleanupPort(port: number) {
  try {
    console.log(`Attempting to force cleanup port ${port}...`);
    await execAsync(`fuser -k ${port}/tcp`);
    console.log(`Force cleanup of port ${port} completed`);
  } catch (error) {
    console.log(`No process found using port ${port}`);
  }
}

async function startServer() {
  const app = express();
  const isProduction = process.env.NODE_ENV === 'production';
  const REQUIRED_PORT = 5000; // Changed from 3000 to 5000 to match workflow requirements
  const MAX_STARTUP_RETRIES = 3;
  let startupAttempts = 0;
  let server: any = null;

  while (startupAttempts < MAX_STARTUP_RETRIES) {
    try {
      console.log(`Starting server initialization (attempt ${startupAttempts + 1}/${MAX_STARTUP_RETRIES})...`, {
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        requiredPort: REQUIRED_PORT
      });

      // Force cleanup of the required port
      await forceCleanupPort(REQUIRED_PORT);
      await portManager.releaseAll();
      console.log('Complete port cleanup finished');

      // Increased wait time for ports to fully release (was 1000ms, now 3000ms)
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Check database health (non-blocking)
      console.log('Checking database health...');
      try {
        const dbHealth = await checkDatabaseHealth();
        if (dbHealth.healthy) {
          console.log('✅ Database health check passed');
        } else {
          console.log('⚠️ Database health check failed, but continuing server startup');
          console.log('The application will run with limited functionality without database access');
        }
      } catch (dbError) {
        console.error('Database health check error:', dbError);
        console.log('⚠️ Database health check failed with error, but continuing server startup');
        console.log('The application will run with limited functionality without database access');
      }

      // Setup CORS with credentials support
      app.use(cors({
        origin: true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With', 'Accept'],
        exposedHeaders: ['Set-Cookie'],
        maxAge: 86400
      }));
      console.log('CORS configuration applied');

      // Configure express middleware
      app.use(express.json({ limit: '10mb' }));
      app.use(express.urlencoded({ extended: true, limit: '10mb' }));
      app.set("trust proxy", 1);

      app.use('/placeholders', express.static('client/public/placeholders', {
        maxAge: '1d',
        immutable: true,
        etag: true,
        lastModified: true,
        fallthrough: false,
        redirect: false
      }));
      console.log('Static file serving configured');

      // Setup static file serving
      app.use(express.static(path.join(__dirname, "..", "client", "public")));
      // Extra path for direct image access
      app.use('/images', express.static(path.join(__dirname, "..", "client", "public", "images")));

      // Log request paths to debug image loading
      app.use((req, res, next) => {
        if (req.path.includes('.jpg') || req.path.includes('.png')) {
          console.log(`Image requested: ${req.path}`);
        }
        next();
      });

      const server = createServer(app);

      // Health check endpoint is now managed in routes/healthRoutes.ts

      // Set up auth with session support
      console.log('Setting up authentication...');
      if (!process.env.SESSION_SECRET) {
        console.warn('⚠️ No SESSION_SECRET found in environment variables. Using a fallback secret for development only.');
        // Default fallback secret - only for development
        process.env.SESSION_SECRET = 'a2408a928353a9dc67e5d343bd022e4fbc900437a27869fc1d038cc17de00289';
      }
      const sessionMiddleware = await setupAuth(app);
      console.log('Authentication setup complete');

      // Register routes first, before WebSocket setup
      console.log('Registering routes...');
      await registerRoutes(app);
      console.log('Routes registered successfully');

      // Setup WebSocket with session support (after routes are registered)
      console.log('Setting up WebSocket...');
      try {
        const wss = await setupWebSocket(server, sessionMiddleware);
        console.log('WebSocket setup complete');
      } catch (wsError) {
        console.error('WebSocket setup failed:', wsError);
        console.log('⚠️ Continuing without WebSocket support');
      }

      // Setup Vite in development mode only
      if (!isProduction) {
        console.log('Setting up Vite for development...');
        await setupVite(app, server);
        console.log('Vite setup complete');
      } else {
        // In production, use our enhanced static file serving
        console.log('Setting up static file serving for production...');
        
        // --- Inline setupProductionStatic function ---
        // Check multiple possible locations for the built files
        const possiblePaths = [
          path.resolve(__dirname, "public"),
          path.resolve(__dirname, "..", "public"),
          path.resolve(__dirname, "..", "dist", "public"),
          path.resolve(process.cwd(), "dist", "public"),
          path.resolve(process.cwd(), "public"),
          // Add Replit deployment specific paths
          "/home/runner/app/dist/public",
          "/dist/public",
          "/public"
        ];
        
        let distPath = '';
        for (const distDir of possiblePaths) {
          if (fs.existsSync(distDir)) {
            distPath = distDir;
            console.log(`Found static files at: ${distPath}`);
            break;
          }
        }

        if (!distPath) {
          console.error('Warning: Could not find the build directory, checked:', possiblePaths);
          // Create a simple HTML page to indicate the build is missing
          app.use("*", (_req, res) => {
            res.status(500).send(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>Build Not Found</title>
                  <style>
                    body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
                    .error { color: #e74c3c; margin: 20px 0; }
                  </style>
                </head>
                <body>
                  <h1>Application Error</h1>
                  <p class="error">The production build files could not be found.</p>
                  <p>Please make sure the application was built correctly before deployment.</p>
                </body>
              </html>
            `);
          });
        } else {
          // Configure static file serving with proper caching
          app.use(express.static(distPath, {
            maxAge: '1d',
            etag: true,
            index: false // Don't automatically serve index.html for directory requests
          }));

          // Serve specific asset directories with longer cache times
          if (fs.existsSync(path.join(distPath, 'assets'))) {
            app.use('/assets', express.static(path.join(distPath, 'assets'), {
              maxAge: '7d',
              immutable: true,
              etag: true
            }));
          }

          // fall through to index.html for any route not found - enables client-side routing
          app.use("*", (_req, res) => {
            try {
              console.log(`Attempting to serve index.html from: ${path.resolve(distPath, "index.html")}`);
              res.sendFile(path.resolve(distPath, "index.html"));
            } catch (err) {
              console.error(`Error serving index.html: ${err}`);
              // Fallback to a simple HTML response if file cannot be found
              res.status(200).send(`
                <!DOCTYPE html>
                <html>
                  <head>
                    <title>KHUSH Gift Gallery</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                      body { font-family: Arial, sans-serif; background: #000; color: #fff; text-align: center; padding: 20px; }
                      h1 { color: #f5a623; }
                      .container { max-width: 800px; margin: 0 auto; }
                      .message { margin: 30px 0; line-height: 1.6; }
                      .footer { margin-top: 40px; font-size: 14px; color: #777; }
                    </style>
                  </head>
                  <body>
                    <div class="container">
                      <h1>KHUSH Gift Gallery</h1>
                      <div class="message">
                        <p>Welcome to our luxury gift boutique.</p>
                        <p>Please try refreshing the page. If the problem persists, please check back soon.</p>
                      </div>
                    </div>
                  </body>
                </html>
              `);
            }
          });
        }
        // --- End of inline function ---
        
        console.log('Static file serving for production complete');
      }

      // In production, use PORT env var or fixed port, in dev use port manager
      let port: number;
      if (isProduction) {
        port = parseInt(process.env.PORT || '8080', 10);
        console.log(`Using production port: ${port}`);
      } else {
        // Attempt to acquire a port, preferring the required port but accepting others
        console.log(`Attempting to acquire port ${REQUIRED_PORT} or another available port...`);
        port = await portManager.acquirePort(REQUIRED_PORT, REQUIRED_PORT + 100);
        console.log(`Successfully acquired port ${port}${port !== REQUIRED_PORT ? ` (preferred was ${REQUIRED_PORT})` : ''}`);
      }

      // Start the server with enhanced error handling
      await new Promise<void>((resolve, reject) => {
        const serverInstance = server.listen(port, '0.0.0.0', () => {
          console.log('Server successfully started:', {
            url: `http://0.0.0.0:${port}`,
            publicUrl: `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`,
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

        // Set server timeout to prevent hanging connections
        serverInstance.timeout = 30000; // 30 seconds
        serverInstance.keepAliveTimeout = 5000; // 5 seconds
        serverInstance.headersTimeout = 6000; // 6 seconds (must be > keepAliveTimeout)
      });

      // Setup cleanup handlers
      const cleanup = async () => {
        console.log('Starting cleanup process...');
        try {
          // Close the HTTP server first
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

      return;

    } catch (error) {
      startupAttempts++;
      console.error(`Server startup attempt ${startupAttempts} failed:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });

      try {
        await forceCleanupPort(REQUIRED_PORT);
        await portManager.releaseAll();
        console.log('Ports released after failed attempt');
      } catch (cleanupError) {
        console.error('Failed to cleanup ports:', cleanupError);
      }

      if (startupAttempts < MAX_STARTUP_RETRIES) {
        const delay = startupAttempts * 3000; // Increased delay between retries
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

  // Don't exit the process in development mode to allow recovery
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

startServer().catch(error => {
  console.error('Unhandled error during server startup:', {
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString()
  });
  process.exit(1);
});