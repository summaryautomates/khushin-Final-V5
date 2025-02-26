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
        // Detailed logging of verification attempt
        console.log('WebSocket verification attempt:', {
          headers: info.req.headers,
          cookies: info.req.headers.cookie,
          url: info.req.url,
          timestamp: new Date().toISOString()
        });

        // Apply session middleware with timeout and enhanced error handling
        await Promise.race([
          new Promise((resolve, reject) => {
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
              resolve(undefined);
            });
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Session middleware timeout')), 5000)
          )
        ]);

        const session = info.req.session as ExtendedSessionData;

        // Log parsed session details
        console.log('WebSocket session parsed:', {
          sessionId: session?.id,
          isAuthenticated: !!session?.passport?.user,
          userId: session?.passport?.user,
          timestamp: new Date().toISOString()
        });

        // In development, allow connections but log authentication status
        const isProduction = process.env.NODE_ENV === 'production';
        if (!isProduction || (session && session.passport?.user)) {
          callback(true, undefined, undefined, {
            isAuthenticated: !!session?.passport?.user,
            sessionId: session?.id,
            userId: session?.passport?.user
          });
        } else {
          console.warn('Authentication failed:', {
            sessionExists: !!session,
            hasPassport: !!session?.passport,
            timestamp: new Date().toISOString()
          });
          callback(false, 401, 'Unauthorized');
        }

      } catch (error) {
        console.error('WebSocket verification error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString()
        });

        const isProduction = process.env.NODE_ENV === 'production';
        if (isProduction) {
          callback(false, 401, 'Unauthorized');
        } else {
          // In development, allow connection but mark as unauthenticated
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

      // Log successful connection
      console.log('WebSocket connection established:', {
        sessionId: ws.sessionId,
        userId: ws.userId,
        isAuthenticated: !!ws.userId,
        timestamp: new Date().toISOString()
      });

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

      // Handle incoming messages with timeout and enhanced error handling
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
              console.warn('Unknown message type received:', {
                type: data.type,
                timestamp: new Date().toISOString()
              });
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Unknown message type',
                timestamp: new Date().toISOString()
              }));
          }
        } catch (error) {
          console.error('Message handling error:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          });
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format',
            timestamp: new Date().toISOString()
          }));
        }
      });

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
        console.log('WebSocket connection closed:', {
          sessionId: ws.sessionId,
          userId: ws.userId,
          timestamp: new Date().toISOString()
        });
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