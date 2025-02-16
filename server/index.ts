import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Basic middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

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
      log(`Error: ${message}`);
      res.status(status).json({ message });
    });

    const port = parseInt(process.env.PORT || "5000", 10);
    let currentPort = port;
    let maxRetries = 3;
    let retryCount = 0;

    const startServer = () => {
      log(`Attempting to start server on port ${currentPort}`);

      server.listen(currentPort, "0.0.0.0", async () => {
        log(`Server bound to port ${currentPort}`);

        if (app.get("env") === "development") {
          log("Initializing Vite middleware setup...");
          try {
            await setupVite(app, server);
            log("Vite middleware setup completed successfully");
          } catch (error) {
            log(`Critical error in Vite setup: ${error}`);
            process.exit(1);
          }
        } else {
          log("Setting up static file serving");
          serveStatic(app);
        }
      }).on('error', (err: any) => {
        if (err.code === 'EADDRINUSE' && retryCount < maxRetries) {
          retryCount++;
          currentPort = port + retryCount;
          log(`Port ${currentPort - 1} is in use, trying port ${currentPort}`);
          startServer();
        } else {
          log(`Fatal error starting server: ${err}`);
          process.exit(1);
        }
      });
    };

    startServer();
  } catch (err) {
    log(`Fatal error during server initialization: ${err}`);
    process.exit(1);
  }
})();