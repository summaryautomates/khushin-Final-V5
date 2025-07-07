import { WebSocket, WebSocketServer } from 'ws';
import { storage } from './storage';
import type { SessionData } from 'express-session';
import { Server } from 'http';

interface AuthenticatedWebSocket extends WebSocket {
  isAlive: boolean;
  userId?: number;
  sessionId?: string;
}

interface ExtendedSessionData extends SessionData {
  id?: string;
  passport?: {
    user: number;
  };
}

export function setupWebSocket(server: Server, sessionMiddleware: any) {
  const wss = new WebSocketServer({
    server,
    path: '/ws', 
    clientTracking: true,
    perMessageDeflate: {
      threshold: 1024, // Only compress messages larger than 1KB
    },
    maxPayload: 64 * 1024, // Increased to 64KB max payload
    verifyClient: async (info: any, callback: any) => {
      try {
        // Create a mock response object for session middleware
        const res: any = {
          setHeader: () => {},
          getHeader: () => {},
          removeHeader: () => {}
        };

        // Apply session middleware with promise wrapper and increased timeout
        const sessionPromise = new Promise<void>((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            console.warn('Session middleware timeout, continuing without session');
            resolve(); // Resolve anyway to allow connection in development
          }, 5000); // Reduced timeout to prevent hanging

          try {
            sessionMiddleware(info.req, res, (err: Error) => {
              clearTimeout(timeoutId);
              if (err) {
                console.error('Session middleware error:', {
                  error: err.message,
                  stack: err.stack,
                  timestamp: new Date().toISOString()
                });
                reject(err);
                return;
              }
              resolve();
            });
          } catch (syncError) {
            clearTimeout(timeoutId);
            console.error('Synchronous session middleware error:', syncError);
            reject(syncError);
          }
        });

        await sessionPromise;

        const session = info.req.session as ExtendedSessionData;

        // Debug session state
        console.log('WebSocket authentication details:', {
          sessionExists: !!session,
          sessionId: session?.id,
          hasPassport: !!session?.passport,
          userId: session?.passport?.user,
          timestamp: new Date().toISOString(),
          origin: info.origin,
          userAgent: info.req.headers['user-agent']
        });

        // In development, allow connections but mark auth status
        const isProduction = process.env.NODE_ENV === 'production';
        const isAuthenticated = !!session?.passport?.user;
        
        // Always accept connections in both development and production
        // This allows the WebSocket to work even for unauthenticated users
        // They'll still see their authentication status in the connection message

        // Allow connection with auth info
        callback(true, undefined, undefined, {
          isAuthenticated,
          sessionId: session?.id,
          userId: session?.passport?.user
        });

      } catch (error) {
        console.error('WebSocket verification error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString()
        });

        // Always provide a callback to prevent hanging connections
        try {
          // In development, allow connection but mark as unauthenticated
          const isProduction = process.env.NODE_ENV === 'production';
          if (isProduction) {
            // Even in production, allow connection but mark as unauthenticated
            callback(true, undefined, undefined, {
              isAuthenticated: false,
              sessionId: null,
              userId: null
            });
          } else {
            callback(true, undefined, undefined, {
              isAuthenticated: false,
              sessionId: null,
              userId: null
            });
          }
        } catch (callbackError) {
          console.error('Error calling WebSocket verification callback:', callbackError);
          // Last resort - reject the connection
          try {
            callback(false, 500, 'Internal Server Error');
          } catch (finalError) {
            console.error('Final callback error:', finalError);
          }
        }
      }
    }
  });

  // Track active connections with a maximum limit
  const MAX_CONNECTIONS = 1000; // Increased back to 1000
  const activeConnections = new Map<string, AuthenticatedWebSocket>();

  // Heartbeat interval (every 30 seconds)
  const heartbeatInterval = setInterval(() => {
    const clientCount = wss.clients.size;
    if (clientCount > 0) {
      console.log(`WebSocket heartbeat check - ${clientCount} active connections`);
    }
    
    wss.clients.forEach((ws: WebSocket) => {
      const client = ws as AuthenticatedWebSocket;
      if (!client.isAlive) {
        console.log('Terminating inactive WebSocket connection', {
          sessionId: client.sessionId,
          userId: client.userId,
          timestamp: new Date().toISOString()
        });
        if (client.sessionId) {
          activeConnections.delete(client.sessionId);
        }
        return client.terminate();
      }
      client.isAlive = false;
      try {
        if (client.readyState === WebSocket.OPEN) {
          client.ping();
          // Send a ping message as well for browsers that don't support ping frames
          client.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
        }
      } catch (error) {
        console.error('Error sending ping:', error);
        client.terminate();
      }
    });
  }, 30000);

  wss.on('connection', async (ws: AuthenticatedWebSocket, req) => {
    try {
      // Check connection limit
      if (activeConnections.size >= MAX_CONNECTIONS) {
        console.warn('Maximum WebSocket connections reached, rejecting new connection');
        // Instead of rejecting, close the oldest connection
        const oldestConnection = activeConnections.entries().next().value;
        if (oldestConnection) {
          const [oldSessionId, oldWs] = oldestConnection;
          console.log(`Closing oldest connection (${oldSessionId}) to make room for new connection`);
          try {
            oldWs.close(1000, 'Connection replaced by newer connection');
            activeConnections.delete(oldSessionId);
          } catch (err) {
            console.error('Error closing oldest connection:', err);
          }
        }
      }

      ws.isAlive = true;
      const session = (req as any).session as ExtendedSessionData;

      ws.sessionId = session?.id;
      ws.userId = session?.passport?.user;

      // Log connection details
      console.log('New WebSocket connection:', {
        sessionId: ws.sessionId,
        userId: ws.userId,
        isAuthenticated: !!ws.userId,
        timestamp: new Date().toISOString(),
        totalConnections: activeConnections.size + 1
      });

      if (ws.sessionId) {
        // Close existing connection if it exists
        const existingConnection = activeConnections.get(ws.sessionId);
        if (existingConnection && existingConnection.readyState === WebSocket.OPEN) {
          try {
            existingConnection.close(1000, 'New connection established');
          } catch (err) {
            console.warn('Error closing existing connection:', err);
          }
        }
        activeConnections.set(ws.sessionId, ws);
      }

      // Send initial connection status with retry logic
      const sendInitialMessage = async (retries = 3) => {
        for (let i = 0; i < retries; i++) {
          await new Promise(resolve => setTimeout(resolve, 100)); // Small delay before first attempt
          try {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'connected',
                data: {
                  userId: ws.userId,
                  isAuthenticated: !!ws.userId,
                  timestamp: new Date().toISOString()
                }
              }));
              break;
            }
          } catch (sendError) {
            console.error(`Error sending initial message (attempt ${i + 1}):`, sendError);
            if (i === retries - 1) {
              console.error('Failed to send initial message after all retries');
            } else {
              await new Promise(resolve => setTimeout(resolve, 100 * (i + 1))); // Exponential backoff
            }
          }
        }
      };

      await sendInitialMessage();

      // Handle pong messages to keep connection alive
      ws.on('pong', () => {
        ws.isAlive = true;
        console.log('Received pong from client');
      });
      
      // Also handle ping messages from client
      ws.on('ping', () => {
        ws.isAlive = true;
        try {
          if (ws.readyState === WebSocket.OPEN) {
            ws.pong();
          }
        } catch (error) {
          console.error('Error sending pong:', error);
        }
      });

      // Handle incoming messages with rate limiting
      let messageCount = 0;
      let lastMessageTime = Date.now();
      const MESSAGE_RATE_LIMIT = 10; // Max 10 messages per second
      const RATE_LIMIT_WINDOW = 1000; // 1 second window

      ws.on('message', (data: WebSocket.RawData) => {
        try {
          // Simple rate limiting
          const now = Date.now();
          if (now - lastMessageTime > RATE_LIMIT_WINDOW) {
            messageCount = 0;
            lastMessageTime = now;
          }
          
          messageCount++;
          if (messageCount > MESSAGE_RATE_LIMIT) {
            console.warn('Rate limit exceeded for WebSocket connection', {
              sessionId: ws.sessionId,
              userId: ws.userId
            });
            ws.send(JSON.stringify({
              type: 'error',
              error: 'Rate limit exceeded',
              timestamp: new Date().toISOString()
            }));
            return;
          }

          const messageStr = data instanceof Buffer ? data.toString() : data.toString();
          let parsedMessage;

          try {
            parsedMessage = JSON.parse(messageStr);
          } catch (parseError) {
            console.warn('Failed to parse WebSocket message:', {
              error: parseError instanceof Error ? parseError.message : 'Unknown error',
              timestamp: new Date().toISOString(),
              messagePreview: messageStr.substring(0, 100)
            });

            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'error',
                error: 'Invalid message format',
                timestamp: new Date().toISOString()
              }));
            }
            return;
          }

          // Handle ping message specifically
          if (parsedMessage && parsedMessage.type === 'ping') {
            ws.isAlive = true;
            try {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ 
                  type: 'pong', 
                  timestamp: new Date().toISOString() 
                }));
              }
            } catch (error) {
              console.error('Error sending pong message:', error);
            }
            return;
          }

          // Log other messages
          console.log('WebSocket message received:', {
            userId: ws.userId,
            sessionId: ws.sessionId,
            type: parsedMessage?.type,
            timestamp: new Date().toISOString()
          });

        } catch (msgError) {
          console.error('Error handling message:', msgError);
        }
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('WebSocket error:', {
          userId: ws.userId,
          sessionId: ws.sessionId,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      });

      // Handle connection close
      ws.on('close', (code, reason) => {
        if (ws.sessionId) {
          activeConnections.delete(ws.sessionId);
        }
        console.log('WebSocket connection closed:', {
          userId: ws.userId,
          sessionId: ws.sessionId,
          code,
          reason: reason?.toString(),
          timestamp: new Date().toISOString(),
          remainingConnections: activeConnections.size
        });
      });

    } catch (error) {
      console.error('Connection handling error:', error);
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close(1011, 'Server error');
        }
      } catch (closeError) {
        console.error('Error closing WebSocket after error:', closeError);
      }
    }
  });

  // Handle WebSocket server errors
  wss.on('error', (error) => {
    console.error('WebSocket server error:', error);
  });

  // Cleanup on server close
  wss.on('close', () => {
    console.log('WebSocket server closing, cleaning up resources');
    clearInterval(heartbeatInterval);
    activeConnections.clear();
  });

  // Graceful shutdown handler
  const gracefulShutdown = () => {
    console.log('Initiating WebSocket server graceful shutdown');
    clearInterval(heartbeatInterval);
    
    // Close all active connections
    wss.clients.forEach((client) => {
      try {
        if (client.readyState === WebSocket.OPEN) {
          client.close(1001, 'Server shutting down');
        }
      } catch (error) {
        console.error('Error closing client during shutdown:', error);
      }
    });
    
    activeConnections.clear();
    
    // Close the WebSocket server
    wss.close(() => {
      console.log('WebSocket server closed gracefully');
    });
  };

  // Register shutdown handlers
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);

  return wss;
}