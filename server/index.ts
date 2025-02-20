import express, { type Express } from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from 'ws';
import { portManager } from './port-manager';
import { registerRoutes } from './routes';
import { setupVite } from './vite';
import { setupAuth } from './auth';
import cors from 'cors';

const app = express();
app.use(express.json());

// Create HTTP server first
const server = createServer(app);

// Update CORS configuration to handle credentials and WebSocket
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'WS', 'WSS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Upgrade', 'Connection'],
}));

// Basic health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

const PORT = 5000;

// Extend WebSocket type to include isAlive property
interface ExtendedWebSocket extends WebSocket {
  isAlive: boolean;
}

// Start server
const startServer = async () => {
  let wss: WebSocketServer | null = null;

  try {
    console.log('Starting server...');
    const port = PORT;
    console.log(`Found available port: ${port}`);

    // Setup authentication first
    console.log('Setting up authentication...');
    try {
      await setupAuth(app);
      console.log('Authentication setup completed');
    } catch (error) {
      console.error('Authentication setup error:', error);
      throw error;
    }

    // Setup routes after auth
    console.log('Registering API routes...');
    try {
      await registerRoutes(app);
      console.log('API routes registered successfully');
    } catch (error) {
      console.error('Route registration error:', error);
      throw error;
    }

    // Setup Vite after API routes
    console.log('Setting up Vite...');
    try {
      await setupVite(app, server);
      console.log('Vite setup completed');
    } catch (error) {
      console.error('Vite setup error:', error);
      throw error;
    }

    // Setup WebSocket server with improved stability configuration
    console.log('Setting up WebSocket server...');
    wss = new WebSocketServer({ 
      server,
      path: '/ws',
      clientTracking: true,
      perMessageDeflate: false,
      maxPayload: 1024 * 1024,
    });

    // WebSocket connection handling
    wss.on('connection', function(ws: ExtendedWebSocket, req) {
      const clientIp = req.socket.remoteAddress;
      console.log(`WebSocket client connected from ${clientIp}`);

      ws.isAlive = true;

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('error', (error) => {
        console.error(`WebSocket error from ${clientIp}:`, error);
        ws.isAlive = false;
        ws.terminate();
      });

      ws.on('close', () => {
        console.log(`WebSocket client disconnected from ${clientIp}`);
        ws.isAlive = false;
      });

      // Send immediate ping to verify connection
      ws.ping();
    });

    // Handle upgrade requests with proper path checking
    server.on('upgrade', (request, socket, head) => {
      console.log(`Upgrade request received for path: ${request.url}`);

      if (request.url !== '/ws') {
        console.log(`Rejecting upgrade request for invalid path: ${request.url}`);
        socket.destroy();
        return;
      }

      // Prevent multiple upgrade attempts for the same socket
      if ((socket as any).isUpgraded) {
        console.log('Ignoring duplicate upgrade attempt for socket');
        return;
      }

      console.log('Processing WebSocket upgrade request...');
      (socket as any).isUpgraded = true;

      wss!.handleUpgrade(request, socket, head, (ws) => {
        console.log('WebSocket upgrade successful, emitting connection event');
        wss!.emit('connection', ws, request);
      });
    });

    // Implement ping/pong for connection health checks with proper type casting
    const interval = setInterval(function() {
      if (!wss) return;

      const clients = wss.clients as Set<ExtendedWebSocket>;
      clients.forEach(function(ws) {
        if (ws.isAlive === false) {
          console.log('Terminating inactive WebSocket connection');
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping(() => {});
      });
    }, 30000);

    wss.on('close', () => {
      clearInterval(interval);
    });

    // Start server with better error handling
    server.listen(port, '0.0.0.0', () => {
      console.log(`Server running at http://0.0.0.0:${port}`);
    }).on('error', (error) => {
      console.error('Server startup error:', error);
      cleanup();
      process.exit(1);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => cleanup());
    process.on('SIGINT', () => cleanup());

  } catch (error) {
    console.error('Critical server error:', error);
    cleanup();
    process.exit(1);
  }

  // Cleanup function
  function cleanup() {
    console.log('Cleaning up server resources...');
    if (wss) {
      wss.close(() => {
        console.log('WebSocket server closed');
      });
      wss = null;
    }
    if (server) {
      server.close(() => {
        console.log('HTTP server closed');
      });
    }
    portManager.releaseAll();
  }
};

startServer();