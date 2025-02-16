import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import compression from "compression";
import session from 'express-session';
import cookieParser from 'cookie-parser';


const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
}));

// Cookie parser middleware
app.use(cookieParser());

// Session middleware with secure cookie options
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key', // **REPLACE with a strong, randomly generated secret**
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Set secure to true in production
    httpOnly: true,
    sameSite: 'lax'
  }
}));


// Enable CORS with configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://khush.in']
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours in seconds
  exposedHeaders: ['Content-Length', 'X-RateLimit-Limit', 'X-RateLimit-Remaining']
}));

// Enable gzip compression
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware with size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

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

// Enhanced security headers
app.use((req: Request, res: Response, next: NextFunction) => {
  // HSTS header
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // No Sniff
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Frame Options
  res.setHeader('X-Frame-Options', 'DENY');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy (formerly Feature-Policy)
  res.setHeader('Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), accelerometer=()');

  // Clear-Site-Data on logout routes
  if (req.path === '/api/auth/logout') {
    res.setHeader('Clear-Site-Data', '"cache", "cookies", "storage"');
  }

  next();
});

// Force HTTPS in production and handle port for HTTPS
const httpsPort = parseInt(process.env.HTTPS_PORT || "443", 10);
const httpPort = parseInt(process.env.PORT || "5000", 10);


const startServer = async (port:number, protocol: string) => {
    const server = await registerRoutes(app);
    const tryPort = (portNum: number): Promise<void> => {
        return new Promise((resolve, reject) => {
          server.listen(portNum, "0.0.0.0")
            .once('error', (err: any) => {
              if (err.code === 'EADDRINUSE') {
                log(`Port ${portNum} is in use, trying ${portNum + 1}`);
                tryPort(portNum + 1).then(resolve).catch(reject);
              } else {
                reject(err);
              }
            })
            .once('listening', () => {
              log(`Server running on ${protocol}://0.0.0.0:${portNum}`);
              resolve();
            });
        });
      };

    try {
        await tryPort(port);
    } catch (err) {
        console.error(`Failed to start ${protocol} server:`, err);
        process.exit(1);
    }

}


if (process.env.NODE_ENV === 'production') {
  //Force HTTPS in production, redirect HTTP to HTTPS
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.secure) {
      next();
    } else {
      res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
  });
  //Start HTTPS server
  startServer(httpsPort, "https");

} else {
    //Start HTTP server in development
    startServer(httpPort, "http");
}



// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  log(`Error: ${message}`);
});


// Setup Vite in development
if (app.get("env") === "development") {
  setupVite(app, null); //Passing null because the server is started later
} else {
  serveStatic(app);
}