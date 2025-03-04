import { WebSocket, WebSocketServer } from 'ws';
import { storage } from './storage';
import type { SessionData } from 'express-session';
import type { Server } from 'http';

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
    verifyClient: async (info: any, callback: any) => {
      try {
        // Create a mock response object for session middleware
        const res: any = {
          setHeader: () => {},
          getHeader: () => {},
          removeHeader: () => {}
        };

        // Apply session middleware with promise wrapper
        await new Promise<void>((resolve, reject) => {
          sessionMiddleware(info.req, res, (err: Error) => {
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
        });

        const session = info.req.session as ExtendedSessionData;

        // Debug session state
        console.log('WebSocket authentication details:', {
          sessionExists: !!session,
          sessionId: session?.id,
          hasPassport: !!session?.passport,
          userId: session?.passport?.user,
          cookies: info.req.headers.cookie,
          timestamp: new Date().toISOString(),
          headers: info.req.headers
        });

        // In development, allow connections but mark auth status
        const isProduction = process.env.NODE_ENV === 'production';
        const isAuthenticated = !!session?.passport?.user;

        // Always accept in development, check auth in production
        if (isProduction && !isAuthenticated) {
          console.warn('Production WebSocket connection rejected - not authenticated');
          callback(false, 401, 'Unauthorized');
          return;
        }

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

        // In development, allow connection but mark as unauthenticated
        const isProduction = process.env.NODE_ENV === 'production';
        if (isProduction) {
          callback(false, 401, 'Unauthorized');
        } else {
          callback(true, undefined, undefined, {
            isAuthenticated: false,
            sessionId: null,
            userId: null
          });
        }
      }
    }
  });

  // Track active connections with a maximum limit
  const MAX_CONNECTIONS = 1000;
  const activeConnections = new Map<string, AuthenticatedWebSocket>();

  // Heartbeat interval (every 30 seconds)
  const heartbeatInterval = setInterval(() => {
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
        client.ping();
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
        ws.close(1013, 'Maximum connections reached');
        return;
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
        headers: req.headers
      });

      if (ws.sessionId) {
        // Close existing connection if it exists
        const existingConnection = activeConnections.get(ws.sessionId);
        if (existingConnection) {
          try {
            existingConnection.close(1000, 'New connection established');
          } catch (err) {
            console.warn('Error closing existing connection:', err);
          }
        }
        activeConnections.set(ws.sessionId, ws);
      }

      // Send initial connection status
      try {
        ws.send(JSON.stringify({
          type: 'connected',
          data: {
            userId: ws.userId,
            isAuthenticated: !!ws.userId,
            timestamp: new Date().toISOString()
          }
        }));
      } catch (sendError) {
        console.error('Error sending initial message:', sendError);
      }

      // Handle pong messages to keep connection alive
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      // Handle incoming messages
      ws.on('message', (data: WebSocket.RawData) => {
        try {
          const messageStr = data instanceof Buffer ? data.toString() : data.toString();
          let parsedMessage;

          try {
            parsedMessage = JSON.parse(messageStr);
          } catch (parseError) {
            console.warn('Failed to parse WebSocket message:', {
              error: parseError instanceof Error ? parseError.message : 'Unknown error',
              timestamp: new Date().toISOString(),
              messagePreview: data instanceof Buffer ? 
                data.toString('utf8', 0, 100) : 
                String(data).substring(0, 100)
            });

            ws.send(JSON.stringify({
              type: 'error',
              error: 'Invalid message format',
              timestamp: new Date().toISOString()
            }));
            return;
          }

          // Handle ping message specifically
          if (parsedMessage && parsedMessage.type === 'ping') {
            ws.isAlive = true;
            ws.send(JSON.stringify({ 
              type: 'pong', 
              timestamp: new Date().toISOString() 
            }));
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
      ws.on('close', () => {
        if (ws.sessionId) {
          activeConnections.delete(ws.sessionId);
        }
        console.log('WebSocket connection closed:', {
          userId: ws.userId,
          sessionId: ws.sessionId,
          timestamp: new Date().toISOString()
        });
      });

    } catch (error) {
      console.error('Connection handling error:', error);
      try {
        ws.close(1011, 'Server error');
      } catch (closeError) {
        console.error('Error closing WebSocket after error:', closeError);
      }
    }
  });

  // Cleanup on server close
  wss.on('close', () => {
    clearInterval(heartbeatInterval);
    activeConnections.clear();
  });

  return wss;
}