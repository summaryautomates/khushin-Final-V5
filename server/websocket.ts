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

  // Heartbeat interval (every 20 seconds)
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
  }, 20000);

  wss.on('connection', async (ws: AuthenticatedWebSocket, req) => {
    try {
      // Check connection limit
      if (activeConnections.size >= MAX_CONNECTIONS) {
        ws.close(1013, 'Maximum connections reached');
        return;
      }
      
      // Set a timeout for initial response
      const connectionTimeout = setTimeout(() => {
        try {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'error',
              data: { message: 'Connection timed out waiting for initial response' }
            }));
          }
        } catch (timeoutError) {
          console.error('Error sending timeout message:', timeoutError);
        }
      }, 10000);

      ws.isAlive = true;
      const session = (req as any).session as ExtendedSessionData;

      ws.sessionId = session?.id;
      ws.userId = session?.passport?.user;

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

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('message', (message) => {
        try {
          // Parse the message if it's a string
          let parsedMessage;
          try {
            if (typeof message === 'string') {
              parsedMessage = JSON.parse(message);
            } else if (message instanceof Buffer) {
              parsedMessage = JSON.parse(message.toString());
            } else {
              console.warn('Unknown message format received');
              return;
            }
          } catch (parseError) {
            console.warn('Failed to parse WebSocket message:', {
              error: parseError instanceof Error ? parseError.message : 'Unknown error',
              timestamp: new Date().toISOString(),
              message: typeof message === 'string' ? message.substring(0, 100) : 'Binary data'
            });
            
            // Send error response to client
            try {
              ws.send(JSON.stringify({
                type: 'error',
                error: 'Invalid message format',
                timestamp: new Date().toISOString()
              }));
            } catch (sendError) {
              console.error('Error sending error response:', sendError);
            }
            return;
          }

          // Handle ping message specifically
          if (parsedMessage && parsedMessage.type === 'ping') {
            ws.isAlive = true;
            try {
              ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
            } catch (sendError) {
              console.error('Error sending pong:', sendError);
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
      try {
        ws.close(1011, 'Server error');
      } catch (closeError) {
        console.error('Error closing WebSocket after error:', closeError);
      }
    }
  });

  wss.on('close', () => {
    clearInterval(heartbeatInterval);
    activeConnections.clear();
  });

  return wss;
}