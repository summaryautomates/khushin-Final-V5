import express, { type Express } from "express";
import { createServer as createHttpServer } from "http";
import { createServer as createViteServer, createLogger } from 'vite';
import { portManager } from './port-manager';
import { setupAuth } from './auth';

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// Initialize express app and basic middleware
const app = express();
app.use(express.json());

// Basic health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

const PORT_RANGE = {
  start: 5000,
  end: 5500
};

// Start server
const startServer = async () => {
  try {
    log('Starting server...', 'server');
    const port = await portManager.acquirePort(PORT_RANGE.start, PORT_RANGE.end);
    log(`Found available port: ${port}`, 'server');

    // Create HTTP server
    const server = createHttpServer(app);

    // Setup authentication first
    log('Setting up authentication...', 'server');
    try {
      await setupAuth(app);
      log('Authentication setup completed', 'server');
    } catch (error) {
      log(`Authentication setup error: ${(error as Error).message}`, 'server');
      throw error;
    }

    // Setup routes after authentication
    log('Registering routes...', 'server');
    try {
      await import("./routes.ts").then(m => m.registerRoutes(app));
      log('Routes registered successfully', 'server');
    } catch (error) {
      log(`Route registration error: ${(error as Error).message}`, 'server');
      throw error;
    }

    // Setup Vite in development
    log('Setting up Vite middleware...', 'vite');
    try {
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
          hmr: {
            server,
            host: '0.0.0.0',
            port: 24678,
            clientPort: 443
          },
          host: '0.0.0.0',
          port
        },
        appType: 'spa',
        customLogger: viteLogger
      });

      app.use(vite.middlewares);
      log('Vite setup complete', 'vite');
    } catch (error) {
      log(`Vite setup error: ${(error as Error).message}`, 'vite');
      throw error;
    }

    // Start server with better error handling
    server.listen(port, '0.0.0.0', () => {
      log(`Server running at http://0.0.0.0:${port}`, 'server');
    }).on('error', (error) => {
      log(`Server error: ${error.message}`, 'server');
      portManager.releaseAll();
      process.exit(1);
    });

  } catch (error) {
    console.error('Critical server error:', error);
    portManager.releaseAll();
    process.exit(1);
  }
};

startServer();