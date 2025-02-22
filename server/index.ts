import express, { type Express } from "express";
import { createServer } from "http";
import { registerRoutes } from './routes';
import { setupVite } from './vite';
import { setupAuth } from './auth';
import cors from 'cors';

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

// Start server
const startServer = async () => {
  try {
    console.log('Starting server...');

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

    // Start HTTP server
    const port = 5000;
    server.listen(port, '0.0.0.0', () => {
      console.log(`Server running at http://0.0.0.0:${port}`);
    });

    // Graceful shutdown handling
    const cleanup = () => {
      console.log('Cleaning up server resources...');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
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