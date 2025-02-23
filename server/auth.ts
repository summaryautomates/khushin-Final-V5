import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { pool } from "./db";
import pgSession from 'connect-pg-simple';

const PostgresStore = pgSession(session);

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export async function setupAuth(app: Express) {
  // Initialize session store with correct options
  const sessionStore = new PostgresStore({
    pool,
    tableName: 'session',
    createTableIfMissing: true,
    pruneSessionInterval: 60, // Prune expired sessions every minute
    errorLog: console.error.bind(console, 'PostgresStore error:'),
  });

  // Handle session store errors
  sessionStore.on('error', (error) => {
    console.error('Session store error:', error);
  });

  // Initialize session middleware with secure settings
  const sessionMiddleware = session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'development-secret-key',
    name: 'sid',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    proxy: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
    }
  });

  // Set trust proxy and use session middleware
  app.set("trust proxy", 1);
  app.use(sessionMiddleware);

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // User deserialization with error handling
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(new Error('User not found'));
      }
      done(null, user);
    } catch (error) {
      console.error('Deserialization error:', error);
      done(error);
    }
  });

  // Configure local strategy with better error handling
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);

        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }

        const passwordValid = await comparePasswords(password, user.password);
        if (!passwordValid) {
          return done(null, false, { message: "Invalid username or password" });
        }

        return done(null, user);
      } catch (error) {
        console.error('Authentication error:', error);
        return done(error);
      }
    })
  );

  // Authentication routes with improved error handling
  app.post("/api/register", async (req, res) => {
    try {
      if (!req.body.username || !req.body.password || !req.body.email) {
        return res.status(400).json({
          message: "Missing required fields"
        });
      }

      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({
          message: "Username already exists"
        });
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword
      });

      const { password, ...userWithoutPassword } = user;

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({
            message: "Error logging in after registration"
          });
        }
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        message: "Error creating user"
      });
    }
  });

  app.post("/api/login", (req, res, next) => {
    if (!req.body.username || !req.body.password) {
      return res.status(400).json({
        message: "Missing username or password"
      });
    }

    passport.authenticate(
      "local",
      (err: Error | null, user: SelectUser | false, info: { message: string } | undefined) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(401).json({
            message: info?.message || "Invalid username or password"
          });
        }
        req.login(user, (err) => {
          if (err) {
            return next(err);
          }
          const { password, ...userWithoutPassword } = user;
          return res.json(userWithoutPassword);
        });
      }
    )(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({
          message: "Error logging out"
        });
      }
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({
            message: "Error destroying session"
          });
        }
        res.clearCookie('sid');
        res.sendStatus(200);
      });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        message: "Not authenticated"
      });
    }
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });

  return sessionMiddleware;
}