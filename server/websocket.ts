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
        // Log verification attempt
        console.log('WebSocket verification attempt:', {
          headers: info.req.headers,
          url: info.req.url,
          timestamp: new Date().toISOString()
        });

        // Apply session middleware to WebSocket upgrade request
        await new Promise((resolve, reject) => {
          sessionMiddleware(info.req, {}, (err: Error) => {
            if (err) {
              console.error('Session middleware error:', {
                error: err.message,
                stack: err.stack,
                headers: info.req.headers,
                timestamp: new Date().toISOString()
              });
              reject(err);
              return;
            }
            resolve(undefined);
          });
        });

        const session = info.req.session as ExtendedSessionData;

        // Log session details
        console.log('WebSocket session details:', {
          sessionId: session?.id,
          isAuthenticated: !!session?.passport?.user,
          userId: session?.passport?.user,
          timestamp: new Date().toISOString()
        });

        // Always allow connection in development
        const isProduction = process.env.NODE_ENV === 'production';
        callback(true, undefined, undefined, {
          isAuthenticated: !!session?.passport?.user,
          sessionId: session?.id,
          userId: session?.passport?.user
        });

      } catch (error) {
        console.error('WebSocket verification error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          headers: info.req.headers,
          timestamp: new Date().toISOString()
        });
        // Don't fail in development
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

  // Track active connections
  const activeConnections = new Map<string, AuthenticatedWebSocket>();

  // Heartbeat interval (every 30 seconds)
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws: WebSocket) => {
      const client = ws as AuthenticatedWebSocket;
      if (!client.isAlive) {
        if (client.sessionId) {
          activeConnections.delete(client.sessionId);
        }
        return client.terminate();
      }
      client.isAlive = false;
      client.ping();
    });
  }, 30000);

  wss.on('connection', async (ws: AuthenticatedWebSocket, req) => {
    try {
      ws.isAlive = true;
      const session = (req as any).session as ExtendedSessionData;

      // Set connection identifiers
      ws.sessionId = session?.id;
      ws.userId = session?.passport?.user;

      if (ws.sessionId) {
        // Store the connection
        activeConnections.set(ws.sessionId, ws);
      }

      // Send initial connection status
      ws.send(JSON.stringify({
        type: 'connected',
        data: {
          userId: ws.userId,
          isAuthenticated: !!ws.userId,
          timestamp: new Date().toISOString()
        }
      }));

      // Handle incoming messages
      ws.on('message', async (message: string) => {
        try {
          const data = JSON.parse(message.toString());

          switch(data.type) {
            case 'ping':
              ws.send(JSON.stringify({
                type: 'pong',
                timestamp: new Date().toISOString()
              }));
              break;

            default:
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Unknown message type',
                timestamp: new Date().toISOString()
              }));
          }
        } catch (error) {
          console.error('Message handling error:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format',
            timestamp: new Date().toISOString()
          }));
        }
      });

      // Connection monitoring
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', {
          userId: ws.userId,
          sessionId: ws.sessionId,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      });

      ws.on('close', () => {
        if (ws.sessionId) {
          activeConnections.delete(ws.sessionId);
        }
      });

    } catch (error) {
      console.error('Connection handling error:', error);
      ws.close(1011, 'Server error');
    }
  });

  // Listen for logout events
  server.on('user:logout', (sessionId: string) => {
    const connection = activeConnections.get(sessionId);
    if (connection) {
      connection.close(1000, 'User logged out');
      activeConnections.delete(sessionId);
    }
  });

  // Cleanup on server close
  wss.on('close', () => {
    clearInterval(heartbeatInterval);
    activeConnections.clear();
  });

  return wss;
}