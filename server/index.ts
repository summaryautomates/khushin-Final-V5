import express, { type Express } from "express";
import { createServer } from "http";
import { portManager } from './port-manager';
import { registerRoutes } from './routes';
import { setupVite } from './vite';
import { setupAuth } from './auth';
import cors from 'cors';

const app = express();
app.use(express.json());

// Update CORS configuration to handle credentials
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

const PORT_RANGE = {
  start: 5000,
  end: 5500
};

// Start server
const startServer = async () => {
  try {
    console.log('Starting server...');
    const port = await portManager.acquirePort(PORT_RANGE.start, PORT_RANGE.end);
    console.log(`Found available port: ${port}`);

    // Create HTTP server
    const server = createServer(app);

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

    // Start server with better error handling
    server.listen(port, '0.0.0.0', () => {
      console.log(`Server running at http://0.0.0.0:${port}`);
    }).on('error', (error) => {
      console.error('Server startup error:', error);
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