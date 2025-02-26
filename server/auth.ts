import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, insertUserSchema } from "@shared/schema";
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
  // Check for required environment variables
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required");
  }

  try {
    // Initialize session store with optimized settings
    const sessionStore = new PostgresStore({
      pool,
      tableName: 'session',
      createTableIfMissing: true,
      pruneSessionInterval: 60 * 15 // Prune expired sessions every 15 minutes
    });

    const isProduction = process.env.NODE_ENV === 'production';

    // Initialize session middleware with enhanced security settings
    const sessionMiddleware = session({
      store: sessionStore,
      secret: process.env.SESSION_SECRET,
      name: 'sid',
      resave: false,
      saveUninitialized: false,
      rolling: true,
      proxy: true,
      cookie: {
        secure: isProduction,
        httpOnly: true,
        sameSite: isProduction ? 'strict' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      }
    });

    // Set trust proxy and use session middleware
    app.set("trust proxy", 1);
    app.use(sessionMiddleware);
    app.use(passport.initialize());
    app.use(passport.session());

    // Enhanced user serialization with error handling
    passport.serializeUser((user: Express.User, done) => {
      try {
        done(null, user.id);
      } catch (error) {
        console.error('User serialization error:', error);
        done(error);
      }
    });

    passport.deserializeUser(async (id: number, done) => {
      try {
        const user = await storage.getUser(id);
        if (!user) {
          return done(null, false);
        }
        done(null, user);
      } catch (error) {
        console.error('User deserialization error:', error);
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

    // Registration route with improved validation and error handling
    app.post("/api/register", async (req, res) => {
      try {
        // Validate registration data
        const validationResult = insertUserSchema.safeParse(req.body);
        if (!validationResult.success) {
          return res.status(400).json({
            message: "Invalid registration data",
            errors: validationResult.error.errors
          });
        }

        // Check if username already exists
        const existingUser = await storage.getUserByUsername(req.body.username);
        if (existingUser) {
          return res.status(400).json({
            message: "Username already exists"
          });
        }

        // Hash password and create user
        const hashedPassword = await hashPassword(req.body.password);
        const userData = {
          ...req.body,
          password: hashedPassword
        };

        const user = await storage.createUser(userData);

        // Log in the user after successful registration
        req.login(user, (loginErr) => {
          if (loginErr) {
            console.error('Login error after registration:', loginErr);
            return res.status(500).json({
              message: "Registration successful but failed to log in"
            });
          }

          // Remove password from response
          const { password: _, ...userWithoutPassword } = user;
          res.status(201).json(userWithoutPassword);
        });

      } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
          message: "Failed to register user"
        });
      }
    });

    // Authentication routes with improved error handling
    app.post("/api/login", (req, res, next) => {
      passport.authenticate(
        "local",
        (err: Error | null, user: SelectUser | false, info: { message: string } | undefined) => {
          if (err) {
            console.error('Login error:', err);
            return res.status(500).json({ message: "Internal server error" });
          }
          if (!user) {
            return res.status(401).json({
              message: info?.message || "Invalid username or password"
            });
          }
          req.login(user, (loginErr) => {
            if (loginErr) {
              console.error('Session creation error:', loginErr);
              return res.status(500).json({ message: "Failed to create session" });
            }
            const { password: _, ...userWithoutPassword } = user;
            return res.json(userWithoutPassword);
          });
        }
      )(req, res, next);
    });

    app.post("/api/logout", (req, res) => {
      const sessionId = req.sessionID;
      req.logout((err) => {
        if (err) {
          console.error('Logout error:', err);
          return res.status(500).json({ message: "Error logging out" });
        }
        req.session.destroy((err) => {
          if (err) {
            console.error('Session destruction error:', err);
            return res.status(500).json({ message: "Error destroying session" });
          }
          res.clearCookie('sid');
          req.app.emit('user:logout', sessionId);
          res.sendStatus(200);
        });
      });
    });

    app.get("/api/user", (req, res) => {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const { password: _, ...userWithoutPassword } = req.user;
      res.json(userWithoutPassword);
    });

    return sessionMiddleware;
  } catch (error) {
    console.error('Auth setup error:', error);
    throw error;
  }
}