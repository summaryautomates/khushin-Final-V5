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
  log("Starting server initialization");

  try {
    const server = await registerRoutes(app);

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      log(`Error: ${message}`);
    });

    const port = parseInt(process.env.PORT || "5000", 10);
    let currentPort = port;
    let serverStarted = false;

    while (!serverStarted && currentPort < port + 3) {
      try {
        log(`Attempting to start server on port ${currentPort}`);

        // Setup middleware based on environment
        if (app.get("env") === "development") {
          log("Setting up Vite middleware");
          await setupVite(app, server);
        } else {
          log("Setting up static file serving");
          serveStatic(app);
        }

        await new Promise<void>((resolve, reject) => {
          server.listen(currentPort, "0.0.0.0")
            .once('error', (err: any) => {
              if (err.code === 'EADDRINUSE') {
                log(`Port ${currentPort} is in use`);
                currentPort++;
                reject(err);
              } else {
                log(`Failed to start server: ${err}`);
                reject(err);
              }
            })
            .once('listening', () => {
              serverStarted = true;
              log(`Server successfully started on port ${currentPort}`);
              resolve();
            });
        });
      } catch (err) {
        if (currentPort >= port + 3) {
          throw new Error('Could not find an available port after 3 attempts');
        }
      }
    }
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();