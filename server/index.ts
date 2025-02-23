import express, { type Express } from "express";
import { createServer } from "http";
import { registerRoutes } from './routes';
import { setupVite } from './vite';
import { setupAuth } from './auth';
import { setupWebSocket } from './websocket';
import cors from 'cors';
import { portManager } from './port-manager';

const app = express();
app.use(express.json());

// Create HTTP server
const server = createServer(app);

// CORS configuration with credentials support
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Start server
const startPort = 5000;
const endPort = 5100;

try {
  const port = await portManager.acquirePort(startPort, endPort);
  server.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}


// Setup authentication and get session middleware
const sessionMiddleware = await setupAuth(app);

// Setup WebSocket after authentication
const wss = await setupWebSocket(server, sessionMiddleware);

// Setup routes
await registerRoutes(app);

// Setup Vite last to ensure all middleware is properly initialized
await setupVite(app, server);

// Graceful shutdown handling
const cleanup = () => {
  console.log('Cleaning up server resources...');
  wss.close(() => {
    console.log('WebSocket server closed');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
};

// Setup signal handlers
process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);