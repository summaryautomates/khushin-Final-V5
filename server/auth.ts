import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, insertUserSchema, guestUserSchema } from "@shared/schema";
import MemoryStore from "memorystore";
import { v4 as uuidv4 } from 'uuid';

const MemoryStoreSession = MemoryStore(session);

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
  try {
    console.log('Starting auth setup...', {
      timestamp: new Date().toISOString()
    });

    // Check for required environment variables
    if (!process.env.SESSION_SECRET) {
      throw new Error("SESSION_SECRET environment variable is required");
    }

    const isProduction = process.env.NODE_ENV === 'production';
    console.log('Environment check complete:', {
      isProduction,
      timestamp: new Date().toISOString()
    });

    // Initialize session store with optimized settings
    const sessionStore = new MemoryStoreSession({
      checkPeriod: 86400000, // Prune expired entries every 24h
      ttl: 24 * 60 * 60 * 1000, // Time to live - 24 hours
      noDisposeOnSet: true, // Improve performance by not disposing old sessions on set
      dispose: (sid: string) => {
        console.log('Session disposed:', { sid, timestamp: new Date().toISOString() });
      },
      stale: false, // Don't serve stale sessions
      max: 1000 // Maximum number of sessions to store
    });

    console.log('Session store initialized');

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
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      }
    });

    // Set trust proxy and use session middleware
    app.set("trust proxy", 1);
    app.use(sessionMiddleware);
    app.use(passport.initialize());
    app.use(passport.session());

    console.log('Session and passport middleware configured');

    // Enhanced user serialization with error handling
    passport.serializeUser((user: Express.User, done) => {
      try {
        console.log('Serializing user:', { id: user.id });
        done(null, user.id);
      } catch (error) {
        console.error('User serialization error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString()
        });
        done(error);
      }
    });

    passport.deserializeUser(async (id: number, done) => {
      try {
        console.log('Deserializing user:', { id });
        const user = await storage.getUser(id);
        if (!user) {
          console.log('User not found during deserialization:', { id });
          return done(null, false);
        }
        console.log('User deserialized successfully:', { id: user.id });
        done(null, user);
      } catch (error) {
        console.error('User deserialization error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString()
        });
        done(error);
      }
    });

    // Configure local strategy with better error handling
    passport.use(
      new LocalStrategy(async (username, password, done) => {
        try {
          console.log('Attempting authentication:', { username });

          const user = await storage.getUserByUsername(username);
          if (!user) {
            console.log('Authentication failed: User not found', { username });
            return done(null, false, { message: "Invalid username or password" });
          }

          const passwordValid = await comparePasswords(password, user.password);
          if (!passwordValid) {
            console.log('Authentication failed: Invalid password', { username });
            return done(null, false, { message: "Invalid username or password" });
          }

          console.log('Authentication successful:', { username });
          return done(null, user);
        } catch (error) {
          console.error('Authentication error:', {
            username,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString()
          });
          return done(error);
        }
      })
    );

    // Set up auth routes
    setupAuthRoutes(app);

    console.log('Auth setup completed successfully');
    return sessionMiddleware;

  } catch (error) {
    console.error('Auth setup error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

/**
 * Creates a guest user with temporary credentials
 * and sets their expiration to 30 days from now
 */
async function createGuestUser() {
  try {
    // Generate random username and password
    const guestId = uuidv4().substring(0, 8);
    const username = `guest_${guestId}`;
    const password = randomBytes(12).toString('hex');
    const email = `${username}@guest.local`;
    
    // Set expiration date to 30 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create the guest user
    const guestUserData = {
      username,
      password: hashedPassword,
      email,
      first_name: null,
      last_name: null,
      is_guest: true,
      expires_at: expiresAt
    };
    
    console.log('Creating guest user:', { username, expiresAt });
    const user = await storage.createUser(guestUserData);
    console.log('Guest user created successfully:', { id: user.id, username: user.username });
    
    return user;
  } catch (error) {
    console.error('Error creating guest user:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

function setupAuthRoutes(app: Express) {
  // Registration route with improved validation and error handling
  app.post("/api/register", async (req, res) => {
    try {
      console.log('Processing registration request:', {
        username: req.body.username,
        timestamp: new Date().toISOString()
      });

      // Validate registration data
      const validationResult = insertUserSchema.safeParse(req.body);
      if (!validationResult.success) {
        console.log('Registration validation failed:', {
          errors: validationResult.error.errors
        });
        return res.status(400).json({
          message: "Invalid registration data",
          errors: validationResult.error.errors
        });
      }

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        console.log('Registration failed: Username exists:', {
          username: req.body.username
        });
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
      console.log('User created successfully:', { id: user.id });

      // Log in the user after successful registration
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error('Login error after registration:', {
            error: loginErr.message,
            stack: loginErr.stack,
            timestamp: new Date().toISOString()
          });
          return res.status(500).json({
            message: "Registration successful but failed to log in"
          });
        }

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });

    } catch (error) {
      console.error('Registration error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      res.status(500).json({
        message: "Failed to register user"
      });
    }
  });

  // Authentication routes with improved error handling
  app.post("/api/login", (req, res, next) => {
    console.log('Processing login request:', {
      username: req.body.username,
      timestamp: new Date().toISOString()
    });

    passport.authenticate(
      "local",
      (err: Error | null, user: SelectUser | false, info: { message: string } | undefined) => {
        if (err) {
          console.error('Login error:', {
            error: err.message,
            stack: err.stack,
            timestamp: new Date().toISOString()
          });
          return res.status(500).json({ message: "Internal server error" });
        }
        if (!user) {
          console.log('Login failed:', { message: info?.message });
          return res.status(401).json({
            message: info?.message || "Invalid username or password"
          });
        }
        req.login(user, (loginErr) => {
          if (loginErr) {
            console.error('Session creation error:', {
              error: loginErr.message,
              stack: loginErr.stack,
              timestamp: new Date().toISOString()
            });
            return res.status(500).json({ message: "Failed to create session" });
          }
          console.log('Login successful:', { userId: user.id });
          const { password: _, ...userWithoutPassword } = user;
          return res.json(userWithoutPassword);
        });
      }
    )(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    const sessionId = req.sessionID;
    console.log('Processing logout request:', { sessionId });

    req.logout((err) => {
      if (err) {
        console.error('Logout error:', {
          error: err.message,
          stack: err.stack,
          timestamp: new Date().toISOString()
        });
        return res.status(500).json({ message: "Error logging out" });
      }
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', {
            error: err.message,
            stack: err.stack,
            timestamp: new Date().toISOString()
          });
          return res.status(500).json({ message: "Error destroying session" });
        }
        res.clearCookie('sid');
        req.app.emit('user:logout', sessionId);
        console.log('Logout successful:', { sessionId });
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
  
  // Guest login endpoint
  app.post("/api/guest-login", async (req, res) => {
    try {
      console.log('Processing guest login request');
      
      // Check if the user is already authenticated
      if (req.isAuthenticated()) {
        console.log('Guest login: User already authenticated', { userId: req.user.id });
        const { password: _, ...userWithoutPassword } = req.user;
        return res.json(userWithoutPassword);
      }
      
      // Create a new guest user
      const guestUser = await createGuestUser();
      
      // Log in the guest user
      req.login(guestUser, (loginErr) => {
        if (loginErr) {
          console.error('Guest login error:', {
            error: loginErr.message,
            stack: loginErr.stack,
            timestamp: new Date().toISOString()
          });
          return res.status(500).json({ message: "Failed to create guest session" });
        }
        
        console.log('Guest login successful:', { userId: guestUser.id });
        const { password: _, ...userWithoutPassword } = guestUser;
        return res.json(userWithoutPassword);
      });
    } catch (error) {
      console.error('Guest login error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      res.status(500).json({ message: "Failed to create guest account" });
    }
  });
  
  // Endpoint to convert guest account to permanent account
  app.post("/api/convert-guest", async (req, res) => {
    try {
      console.log('Processing guest account conversion request');
      
      // Check if the user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Check if the user is a guest
      if (!req.user.is_guest) {
        return res.status(400).json({ message: "Only guest accounts can be converted" });
      }
      
      // Validate conversion data
      const validationResult = insertUserSchema.safeParse(req.body);
      if (!validationResult.success) {
        console.log('Guest conversion validation failed:', {
          errors: validationResult.error.errors
        });
        return res.status(400).json({
          message: "Invalid account data",
          errors: validationResult.error.errors
        });
      }
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser && existingUser.id !== req.user.id) {
        console.log('Guest conversion failed: Username exists:', {
          username: req.body.username
        });
        return res.status(400).json({
          message: "Username already exists"
        });
      }
      
      // Hash password and update user
      const hashedPassword = await hashPassword(req.body.password);
      
      // Update user record in the database
      const updatedUser = await storage.updateUser(req.user.id, {
        ...req.body,
        password: hashedPassword,
        is_guest: false,
        expires_at: null
      });
      
      console.log('Guest account converted successfully:', { id: updatedUser.id });
      
      // Return updated user data
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
      
    } catch (error) {
      console.error('Guest conversion error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      res.status(500).json({ message: "Failed to convert guest account" });
    }
  });
}