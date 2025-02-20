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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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

    // Setup WebSocket server
    console.log('Setting up WebSocket server...');
    wss = new WebSocketServer({ 
      server,
      path: '/ws',
      perMessageDeflate: false
    });

    wss.on('error', (error) => {
      console.error('WebSocket server error:', error);
    });

    // WebSocket connection handling
    wss.on('connection', function(ws: ExtendedWebSocket, req) {
      console.log('WebSocket client connected from:', req.socket.remoteAddress);
      ws.isAlive = true;

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('error', (error) => {
        console.error('WebSocket connection error:', error);
        ws.isAlive = false;
      });

      ws.on('close', (code, reason) => {
        console.log('WebSocket client disconnected. Code:', code, 'Reason:', reason.toString());
        ws.isAlive = false;
      });

      // Send immediate welcome message
      try {
        ws.send(JSON.stringify({ type: 'welcome', message: 'Connected to KHUSH.IN server' }));
      } catch (error) {
        console.error('Error sending welcome message:', error);
      }
    });

    // Heartbeat mechanism
    const heartbeat = setInterval(function() {
      if (!wss) return;

      const clients = wss.clients as Set<ExtendedWebSocket>;
      clients.forEach(function(ws) {
        if (ws.isAlive === false) {
          console.log('Terminating inactive WebSocket connection');
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);

    wss.on('close', () => {
      clearInterval(heartbeat);
    });

    // Start server
    server.listen(port, '0.0.0.0', () => {
      console.log(`Server running at http://0.0.0.0:${port}`);
    });

    // Handle graceful shutdown
    const cleanup = () => {
      console.log('Cleaning up server resources...');
      if (wss) {
        wss.clients.forEach((client) => {
          try {
            (client as WebSocket).terminate();
          } catch (error) {
            console.error('Error terminating client:', error);
          }
        });
        wss.close(() => {
          console.log('WebSocket server closed');
          server.close(() => {
            console.log('HTTP server closed');
            process.exit(0);
          });
        });
      } else {
        server.close(() => {
          console.log('HTTP server closed');
          process.exit(0);
        });
      }
    };

    process.on('SIGTERM', cleanup);
    process.on('SIGINT', cleanup);

  } catch (error) {
    console.error('Critical server error:', error);
    process.exit(1);
  }
};

startServer();