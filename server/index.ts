import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    if (path.startsWith("/api")) {
      const duration = Date.now() - start;
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;

      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine.length > 80 ? logLine.slice(0, 79) + "…" : logLine);
    }
  });

  next();
});

// Initialize server
(async () => {
  const server = await registerRoutes(app);

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    log(`Error: ${message}`);
  });

  // Setup Vite in development
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Try different ports if default port is in use
  const tryPort = (port: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      server.listen(port, "0.0.0.0")
        .once('error', (err: any) => {
          if (err.code === 'EADDRINUSE') {
            log(`Port ${port} is in use, trying ${port + 1}`);
            tryPort(port + 1).then(resolve).catch(reject);
          } else {
            reject(err);
          }
        })
        .once('listening', () => {
          log(`Server running on port ${port}`);
          resolve();
        });
    });
  };

  // Start server on initial port (default 5000) or use PORT env variable
  const initialPort = parseInt(process.env.PORT || "5000", 10);
  try {
    await tryPort(initialPort);
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();