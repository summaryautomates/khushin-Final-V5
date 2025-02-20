import express, { type Express } from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer as createHttpServer } from "http";
import { createServer as createViteServer, createLogger } from 'vite';
import { WebSocket, WebSocketServer } from 'ws';
import { portManager } from './port-manager';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

// Simple static file serving for GLB files
app.use('/attached_assets', express.static('attached_assets', {
  setHeaders: (res, filepath) => {
    if (filepath.endsWith('.glb')) {
      res.setHeader('Content-Type', 'model/gltf-binary');
    }
  }
}));

// Basic health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Basic request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Global server reference for proper cleanup
let globalServer: ReturnType<typeof createHttpServer> | null = null;
let globalWss: WebSocketServer | null = null;

// Cleanup function
function cleanup() {
  return new Promise<void>((resolve) => {
    if (globalWss) {
      globalWss.clients.forEach((client) => {
        client.terminate();
      });
      globalWss.close();
      globalWss = null;
    }

    if (globalServer) {
      globalServer.close(() => {
        globalServer = null;
        resolve();
      });
    } else {
      resolve();
    }
  });
}

const PORT_RANGE = {
  start: 5000,
  end: 5500  // Greatly expanded port range
};

// Start server with improved error handling
const startServer = async () => {
  try {
    // Cleanup any existing instances
    await cleanup();

    log('Starting server...', 'server');

    // Use portManager to acquire an available port
    const port = await portManager.acquirePort(PORT_RANGE.start, PORT_RANGE.end);
    log(`Found available port: ${port}`, 'server');

    // Create HTTP server
    const server = createHttpServer(app);
    globalServer = server;

    // Create WebSocket server
    const wss = new WebSocketServer({ server, path: '/ws' });
    globalWss = wss;

    // WebSocket connection handling with heartbeat
    wss.on('connection', (ws: WebSocket) => {
      log('WebSocket client connected', 'websocket');

      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        }
      }, 30000);

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      ws.on('close', () => {
        clearInterval(pingInterval);
        log('WebSocket client disconnected', 'websocket');
      });
    });

    // Register routes
    log('Registering routes...', 'server');
    await import("./routes.ts").then(m => m.registerRoutes(app));
    log('Routes registered successfully', 'server');

    // Setup Vite in development or serve static files in production
    if (process.env.NODE_ENV !== 'production') {
      log('Setting up Vite middleware...', 'vite');
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
        },
        appType: 'spa',
        customLogger: {
          ...viteLogger,
          error: (msg, options) => {
            viteLogger.error(msg, options);
            process.exit(1);
          },
        },
      });
      app.use(vite.middlewares);
      log('Vite setup complete', 'vite');
    } else {
      const { serveStatic } = await import("./vite.ts");
      serveStatic(app);
    }

    // Start server
    await new Promise<void>((resolve, reject) => {
      const serverTimeout = setTimeout(() => {
        reject(new Error('Server startup timeout'));
      }, 30000);

      server.listen(port, '0.0.0.0', () => {
        clearTimeout(serverTimeout);
        log(`Server running at http://0.0.0.0:${port}`, 'server');
        resolve();
      });
    });

    // Graceful shutdown
    const shutdown = async () => {
      log('Shutting down gracefully...', 'server');
      portManager.releaseAll(); // Release all ports before cleanup
      await cleanup();
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('Critical server error:', error);
    portManager.releaseAll(); // Release ports on error
    await cleanup();
    process.exit(1);
  }
};

// Handle uncaught promise rejections
process.on('unhandledRejection', async (error) => {
  console.error('Unhandled promise rejection:', error);
  portManager.releaseAll();
  await cleanup();
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  console.error('Uncaught exception:', error);
  portManager.releaseAll();
  await cleanup();
  process.exit(1);
});

startServer();