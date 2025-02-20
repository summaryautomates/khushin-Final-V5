import express, { type Express } from "express";
import { createServer as createHttpServer } from "http";
import { createServer as createViteServer, createLogger } from 'vite';
import { portManager } from './port-manager';
import { WebSocketServer } from 'ws';

const viteLogger = createLogger();

// Export globalWss for use in routes.ts
export let globalWss: WebSocketServer | null = null;

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

    // Create HTTP server first
    const server = createHttpServer(app);

    // Initialize WebSocket server with error handling
    globalWss = new WebSocketServer({ 
      server,
      clientTracking: true
    });

    globalWss.on('error', (error) => {
      log(`WebSocket server error: ${error.message}`, 'ws');
    });

    globalWss.on('connection', (ws) => {
      log('New WebSocket connection established', 'ws');

      ws.on('error', (error) => {
        log(`WebSocket connection error: ${error.message}`, 'ws');
      });

      ws.on('close', () => {
        log('WebSocket connection closed', 'ws');
      });
    });

    // Setup routes first
    log('Registering routes...', 'server');
    await import("./routes.ts").then(m => m.registerRoutes(app));
    log('Routes registered successfully', 'server');

    // Setup Vite in development with proper error handling
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
        customLogger: {
          ...viteLogger,
          error: (msg, options) => {
            log(`Vite error: ${msg}`, 'vite');
            viteLogger.error(msg, options);
          }
        }
      });

      app.use(vite.middlewares);
      log('Vite setup complete', 'vite');
    } catch (error) {
      log(`Vite setup error: ${(error as Error).message}`, 'vite');
      throw error;
    }

    // Start server with enhanced error handling
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