import { WebSocket, WebSocketServer } from 'ws';
import { storage } from './storage';
import type { SessionData } from 'express-session';
import type { Server } from 'http';

interface AuthenticatedWebSocket extends WebSocket {
  isAlive: boolean;
  userId?: string;
  reconnectAttempts?: number;
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
  });

  console.log('WebSocket server initialized');

  wss.on('connection', async (ws: AuthenticatedWebSocket, req) => {
    console.log('New WebSocket connection attempt');

    try {
      // Set initial connection state
      ws.isAlive = true;
      ws.reconnectAttempts = 0;

      // Apply session middleware to WebSocket request
      await new Promise((resolve, reject) => {
        sessionMiddleware(req, {}, (err: Error) => {
          if (err) {
            console.error('Session middleware error:', err);
            reject(err);
            return;
          }
          resolve(undefined);
        });
      });

      const session = (req as any).session as ExtendedSessionData;

      // Handle authenticated users
      if (session?.passport?.user) {
        ws.userId = session.passport.user.toString();
        console.log(`Authenticated WebSocket connection for user: ${ws.userId}`);
        ws.send(JSON.stringify({ 
          type: 'connected',
          data: { userId: ws.userId, isAuthenticated: true }
        }));
      } else {
        // Handle public/unauthenticated access
        console.log('Public WebSocket connection established');
        ws.send(JSON.stringify({
          type: 'connected',
          data: { isAuthenticated: false }
        }));
      }

      // Handle incoming messages
      ws.on('message', async (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          console.log('Received WebSocket message:', data);

          switch(data.type) {
            case 'ping':
              ws.send(JSON.stringify({ type: 'pong' }));
              break;
            case 'sync_zoom':
              // Broadcast zoom sync to all clients except sender
              wss.clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify({
                    type: 'zoom_update',
                    data: data.scale
                  }));
                }
              });
              break;
            default:
              console.log('Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('Error handling WebSocket message:', error);
          ws.send(JSON.stringify({ 
            type: 'error',
            message: 'Invalid message format'
          }));
        }
      });

      // Handle pings to keep connection alive
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      // Clean up on close
      ws.on('close', () => {
        console.log(`WebSocket connection closed${ws.userId ? ` for user: ${ws.userId}` : ''}`);
        ws.isAlive = false;
      });

    } catch (error) {
      console.error('WebSocket connection error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Internal server error'
      }));
      ws.close(1011, 'Internal server error');
    }
  });

  // Ping clients periodically to check connection
  const interval = setInterval(() => {
    wss.clients.forEach((client: WebSocket) => {
      const ws = client as AuthenticatedWebSocket;
      if (!ws.isAlive) {
        console.log(`Terminating inactive WebSocket${ws.userId ? ` for user: ${ws.userId}` : ''}`);
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  return wss;
}