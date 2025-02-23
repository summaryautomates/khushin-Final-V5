import { WebSocket, WebSocketServer } from 'ws';
import { storage } from './storage';
import type { SessionData } from 'express-session';
import type { Server } from 'http';

interface AuthenticatedWebSocket extends WebSocket {
  isAlive: boolean;
  userId?: string;
  sessionId?: string;
}

interface ExtendedSessionData extends SessionData {
  passport?: {
    user: string;
  };
}

export function setupWebSocket(server: Server, sessionMiddleware: any) {
  const wss = new WebSocketServer({ 
    server,
    path: '/ws',
    clientTracking: true,
    verifyClient: async (info: any, callback: any) => {
      try {
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

        // Allow the connection but track authentication status
        callback(true, 200, '', {
          isAuthenticated: !!session?.passport?.user,
          sessionId: session?.id
        });
      } catch (error) {
        console.error('WebSocket verification error:', error);
        callback(false, 401, 'Unauthorized');
      }
    }
  });

  console.log('WebSocket server initialized');

  // Track active connections
  const activeConnections = new Map<string, AuthenticatedWebSocket>();

  wss.on('connection', async (ws: AuthenticatedWebSocket, req) => {
    console.log('New WebSocket connection attempt');

    try {
      ws.isAlive = true;
      const session = (req as any).session as ExtendedSessionData;

      if (!session) {
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
        ws.userId = session.passport.user.toString();
        activeConnections.set(ws.sessionId, ws);

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

      // Message handling with improved error handling
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

            case 'sync_zoom':
              if (!ws.userId) {
                ws.send(JSON.stringify({
                  type: 'error',
                  message: 'Authentication required',
                  timestamp: new Date().toISOString()
                }));
                return;
              }

              wss.clients.forEach(client => {
                const authClient = client as AuthenticatedWebSocket;
                if (authClient !== ws && authClient.readyState === WebSocket.OPEN) {
                  authClient.send(JSON.stringify({
                    type: 'zoom_update',
                    data: data.scale,
                    userId: ws.userId,
                    timestamp: new Date().toISOString()
                  }));
                }
              });
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

  // Periodic connection checking
  const interval = setInterval(() => {
    wss.clients.forEach((client: WebSocket) => {
      const ws = client as AuthenticatedWebSocket;
      if (!ws.isAlive) {
        if (ws.sessionId) {
          activeConnections.delete(ws.sessionId);
        }
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
    activeConnections.clear();
  });

  return wss;
}