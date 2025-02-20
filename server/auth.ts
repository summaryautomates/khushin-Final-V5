import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

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
  console.log('Setting up authentication...');

  // Initialize session middleware with secure settings and proper domain config
  const sessionMiddleware = session({
    store: storage.sessionStore, // Use PostgreSQL session store
    secret: process.env.SESSION_SECRET || 'development-secret-key',
    name: 'sid', // Change cookie name for better security
    resave: false,
    saveUninitialized: false,
    rolling: true, // Refresh session with each request
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
      domain: process.env.NODE_ENV === "production" ? '.khush.in' : undefined
    }
  });

  // Set trust proxy and use session middleware
  app.set("trust proxy", 1);
  app.use(sessionMiddleware);
  console.log('Session middleware configured');

  // Make session middleware available for WebSocket authentication
  app.set('sessionMiddleware', sessionMiddleware);

  // Initialize passport after session middleware
  app.use(passport.initialize());
  app.use(passport.session());
  console.log('Passport initialized');

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log(`Attempting authentication for user: ${username}`);
        const user = await storage.getUserByUsername(username);

        if (!user) {
          console.log(`User not found: ${username}`);
          return done(null, false, { message: "Invalid username or password" });
        }

        const passwordValid = await comparePasswords(password, user.password);
        if (!passwordValid) {
          console.log(`Invalid password for user: ${username}`);
          return done(null, false, { message: "Invalid username or password" });
        }

        console.log(`Authentication successful for user: ${username}`);
        return done(null, user);
      } catch (error) {
        console.error('Authentication error:', error);
        return done(error);
      }
    })
  );

  // Passport serialization with more detailed logging
  passport.serializeUser((user, done) => {
    console.log('Serializing user:', user.id);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log('Deserializing user:', id);
      const user = await storage.getUser(id);
      if (!user) {
        console.log('User not found during deserialization:', id);
        return done(new Error('User not found'));
      }
      console.log('User deserialized successfully:', user.id);
      done(null, user);
    } catch (error) {
      console.error('Deserialization error:', error);
      done(error);
    }
  });

  // Authentication routes with improved error handling and logging
  app.post("/api/register", async (req, res) => {
    try {
      console.log('Registration attempt:', req.body.username);

      // Validate required fields
      if (!req.body.username || !req.body.password || !req.body.email) {
        return res.status(400).json({
          message: "Missing required fields"
        });
      }

      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        console.log('Username already exists:', req.body.username);
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
      console.log('User registered successfully:', req.body.username);

      req.login(user, (err) => {
        if (err) {
          console.error('Login error after registration:', err);
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
    console.log('Login attempt:', req.body.username);

    // Validate required fields
    if (!req.body.username || !req.body.password) {
      return res.status(400).json({
        message: "Missing username or password"
      });
    }

    passport.authenticate(
      "local",
      (err: Error | null, user: SelectUser | false, info: { message: string } | undefined) => {
        if (err) {
          console.error('Login error:', err);
          return next(err);
        }
        if (!user) {
          console.log('Login failed:', req.body.username, info?.message);
          return res.status(401).json({
            message: info?.message || "Invalid username or password"
          });
        }
        req.login(user, (err) => {
          if (err) {
            console.error('Session creation error:', err);
            return next(err);
          }
          console.log('Login successful:', user.username);
          const { password, ...userWithoutPassword } = user;
          return res.json(userWithoutPassword);
        });
      }
    )(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    const username = req.user?.username;
    console.log('Logout request for user:', username);
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({
          message: "Error logging out"
        });
      }
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
          return res.status(500).json({
            message: "Error destroying session"
          });
        }
        res.clearCookie('sid');
        console.log('User logged out:', username);
        res.sendStatus(200);
      });
    });
  });

  app.get("/api/user", (req, res) => {
    console.log('User data requested. Authenticated:', req.isAuthenticated());
    console.log('Session ID:', req.sessionID);
    console.log('Session:', req.session);

    if (!req.isAuthenticated()) {
      return res.status(401).json({
        message: "Not authenticated"
      });
    }
    console.log('User data requested for:', req.user?.username);
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });

  console.log('Authentication setup completed');
}