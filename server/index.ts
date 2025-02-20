import express, { type Express } from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from 'ws';
import { portManager } from './port-manager';
import { registerRoutes } from './routes';
import { setupVite } from './vite';
import { setupAuth } from './auth';
import cors from 'cors';

// Enhanced WebSocket interface
interface ExtendedWebSocket extends WebSocket {
  isAlive: boolean;
  id: string;
  lastPingTime?: number;
}

const app = express();
app.use(express.json());

// Create HTTP server
const server = createServer(app);

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

const PORT = 5000;

// Start server
const startServer = async () => {
  let wss: WebSocketServer | null = null;

  try {
    console.log('Starting server...');
    const port = PORT;
    console.log(`Found available port: ${port}`);

    // Setup authentication
    console.log('Setting up authentication...');
    try {
      await setupAuth(app);
      console.log('Authentication setup completed');
    } catch (error) {
      console.error('Authentication setup error:', error);
      throw error;
    }

    // Setup routes
    console.log('Registering API routes...');
    try {
      await registerRoutes(app);
      console.log('API routes registered successfully');
    } catch (error) {
      console.error('Route registration error:', error);
      throw error;
    }

    // Setup Vite
    console.log('Setting up Vite...');
    try {
      await setupVite(app, server);
      console.log('Vite setup completed');
    } catch (error) {
      console.error('Vite setup error:', error);
      throw error;
    }

    // Setup WebSocket server with improved error handling
    console.log('Setting up WebSocket server...');
    wss = new WebSocketServer({ 
      server,
      path: '/ws',
      perMessageDeflate: false,
      clientTracking: true
    });

    // Error handling for the WSS server
    wss.on('error', (error) => {
      console.error('WebSocket server error:', error);
    });

    // Connection handling
    wss.on('connection', function(ws: ExtendedWebSocket, req) {
      // Assign unique ID to connection
      ws.id = Math.random().toString(36).substring(7);
      console.log(`WebSocket client connected - ID: ${ws.id} from: ${req.socket.remoteAddress}`);

      ws.isAlive = true;
      ws.lastPingTime = Date.now();

      // Ping/Pong handling
      ws.on('pong', () => {
        ws.isAlive = true;
        ws.lastPingTime = Date.now();
        console.log(`Received pong from client ${ws.id}`);
      });

      // Error handling
      ws.on('error', (error) => {
        console.error(`WebSocket connection error for client ${ws.id}:`, error);
        ws.isAlive = false;
      });

      // Close handling
      ws.on('close', (code, reason) => {
        console.log(`WebSocket client ${ws.id} disconnected. Code: ${code}, Reason: ${reason.toString()}`);
        ws.isAlive = false;
      });

      // Send welcome message
      try {
        ws.send(JSON.stringify({ 
          type: 'welcome',
          message: 'Connected to KHUSH.IN server',
          clientId: ws.id
        }));
      } catch (error) {
        console.error(`Error sending welcome message to client ${ws.id}:`, error);
      }
    });

    // Enhanced heartbeat mechanism
    const heartbeat = setInterval(function() {
      if (!wss) return;

      const clients = wss.clients as Set<ExtendedWebSocket>;
      const now = Date.now();

      clients.forEach(function(ws) {
        // Check if client hasn't responded for too long
        if (ws.lastPingTime && (now - ws.lastPingTime) > 60000) {
          console.log(`Client ${ws.id} hasn't responded for too long, terminating connection`);
          return ws.terminate();
        }

        if (ws.isAlive === false) {
          console.log(`Terminating inactive WebSocket connection for client ${ws.id}`);
          return ws.terminate();
        }

        ws.isAlive = false;
        try {
          ws.ping();
          console.log(`Sent ping to client ${ws.id}`);
        } catch (error) {
          console.error(`Error sending ping to client ${ws.id}:`, error);
          ws.terminate();
        }
      });
    }, 30000);

    // Cleanup on WSS close
    wss.on('close', () => {
      clearInterval(heartbeat);
      console.log('WebSocket server closed');
    });

    // Start HTTP server
    server.listen(port, '0.0.0.0', () => {
      console.log(`Server running at http://0.0.0.0:${port}`);
    });

    // Graceful shutdown handling
    const cleanup = () => {
      console.log('Cleaning up server resources...');
      if (wss) {
        wss.clients.forEach((client) => {
          try {
            const extClient = client as ExtendedWebSocket;
            console.log(`Closing connection for client ${extClient.id}`);
            extClient.terminate();
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

    // Setup signal handlers
    process.on('SIGTERM', cleanup);
    process.on('SIGINT', cleanup);

  } catch (error) {
    console.error('Critical server error:', error);
    process.exit(1);
  }
};

startServer();