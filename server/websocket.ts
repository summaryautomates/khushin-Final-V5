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
        console.log('WebSocket connection attempt:', {
          headers: info.req.headers,
          cookies: info.req.headers.cookie,
          timestamp: new Date().toISOString()
        });

        // Apply session middleware to WebSocket upgrade request
        await new Promise((resolve, reject) => {
          sessionMiddleware(info.req, {}, (err: Error) => {
            if (err) {
              console.error('Session middleware error:', err);
              reject(err);
              return;
            }
            resolve(undefined);
          });
        });

        const session = info.req.session as ExtendedSessionData;
        console.log('Session after middleware:', {
          sessionId: session?.id,
          isAuthenticated: !!session?.passport?.user,
          timestamp: new Date().toISOString()
        });

        // Allow the connection but track authentication status
        callback(true, 200, '', {
          isAuthenticated: !!session?.passport?.user,
          sessionId: session?.id
        });
      } catch (error) {
        console.error('WebSocket verification error:', {
          error,
          timestamp: new Date().toISOString()
        });
        callback(false, 401, 'Unauthorized');
      }
    }
  });

  console.log('WebSocket server initialized');

  // Track active connections with a Map
  const activeConnections = new Map<string, AuthenticatedWebSocket>();

  // Heartbeat interval
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws: WebSocket) => {
      const client = ws as AuthenticatedWebSocket;
      if (!client.isAlive) {
        console.log('Terminating inactive connection:', {
          userId: client.userId,
          sessionId: client.sessionId,
          timestamp: new Date().toISOString()
        });
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
    console.log('New WebSocket connection established');

    try {
      ws.isAlive = true;
      const session = (req as any).session as ExtendedSessionData;

      if (!session) {
        console.log('No session found for connection');
        ws.send(JSON.stringify({
          type: 'error',
          message: 'No session found',
          timestamp: new Date().toISOString()
        }));
        ws.close(1011, 'No session found');
        return;
      }

      // Set session ID for connection tracking
      ws.sessionId = session.id;

      if (session?.passport?.user) {
        ws.userId = session.passport.user;
        if (ws.sessionId) {
          activeConnections.set(ws.sessionId, ws);
        }

        console.log('Authenticated connection established:', {
          userId: ws.userId,
          sessionId: ws.sessionId,
          timestamp: new Date().toISOString()
        });

        ws.send(JSON.stringify({
          type: 'connected',
          data: {
            userId: ws.userId,
            isAuthenticated: true,
            timestamp: new Date().toISOString()
          }
        }));
      } else {
        console.log('Public connection established:', {
          sessionId: ws.sessionId,
          timestamp: new Date().toISOString()
        });

        ws.send(JSON.stringify({
          type: 'connected',
          data: {
            isAuthenticated: false,
            timestamp: new Date().toISOString()
          }
        }));
      }

      // Handle WebSocket messages
      ws.on('message', async (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          console.log('Received message:', {
            type: data.type,
            userId: ws.userId,
            sessionId: ws.sessionId,
            timestamp: new Date().toISOString()
          });

          switch(data.type) {
            case 'ping':
              ws.send(JSON.stringify({
                type: 'pong',
                timestamp: new Date().toISOString()
              }));
              break;

            default:
              console.log('Unknown message type:', data.type);
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
        console.log('Connection closed:', {
          userId: ws.userId,
          sessionId: ws.sessionId,
          timestamp: new Date().toISOString()
        });
      });

    } catch (error) {
      console.error('Connection handling error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Server error',
        timestamp: new Date().toISOString()
      }));
      ws.close(1011, 'Server error');
    }
  });

  wss.on('close', () => {
    clearInterval(heartbeatInterval);
    activeConnections.clear();
  });

  return wss;
}