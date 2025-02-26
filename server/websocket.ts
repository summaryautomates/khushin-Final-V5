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
        // Apply session middleware
        await new Promise<void>((resolve, reject) => {
          sessionMiddleware(info.req, {}, (err: Error) => {
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

        // In development, allow all connections but log authentication status
        const isProduction = process.env.NODE_ENV === 'production';
        const isAuthenticated = !!session?.passport?.user;

        console.log('WebSocket authentication check:', {
          sessionExists: !!session,
          isAuthenticated,
          userId: session?.passport?.user,
          timestamp: new Date().toISOString()
        });

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
      // Check connection limit
      if (activeConnections.size >= MAX_CONNECTIONS) {
        ws.close(1013, 'Maximum connections reached');
        return;
      }

      ws.isAlive = true;
      const session = (req as any).session as ExtendedSessionData;

      ws.sessionId = session?.id;
      ws.userId = session?.passport?.user;

      if (ws.sessionId) {
        // Close existing connection if it exists
        const existingConnection = activeConnections.get(ws.sessionId);
        if (existingConnection) {
          existingConnection.close(1000, 'New connection established');
        }
        activeConnections.set(ws.sessionId, ws);
      }

      ws.send(JSON.stringify({
        type: 'connected',
        data: {
          userId: ws.userId,
          isAuthenticated: !!ws.userId,
          timestamp: new Date().toISOString()
        }
      }));

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

  wss.on('close', () => {
    clearInterval(heartbeatInterval);
    activeConnections.clear();
  });

  return wss;
}