import express, { type Express } from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer as createHttpServer } from "http";
import { createServer as createViteServer } from 'vite'; // Added Vite server creation

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
    console.log(`${new Date().toISOString()} [server] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Start server with improved error handling
const startServer = async () => {
  try {
    console.log('Starting server...');

    // Create HTTP server
    const server = createHttpServer(app);


    // Register routes
    console.log('Registering routes...');
    await import("./routes.ts").then(m => m.registerRoutes(app));
    console.log('Routes registered successfully');

    // Setup Vite in development or serve static files in production
    if (process.env.NODE_ENV !== 'production') {
      console.log('Setting up Vite middleware...');
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
          hmr: {
            host: '0.0.0.0',
            port: 3000,
            protocol: 'ws'
          }
        },
      });
      app.use(vite.middlewares);
      console.log('Vite setup complete');
    } else {
      const { serveStatic } = await import("./vite.ts");
      serveStatic(app);
    }

    // Start server on port 5000 to match workflow expectations
    const PORT = 5000;
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running at http://0.0.0.0:${PORT}`);
      console.log(`Server listening on port ${PORT}`);
    });

    // Graceful shutdown
    const shutdown = () => {
      console.log('Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('Critical server error:', error);
    process.exit(1);
  }
};

startServer();