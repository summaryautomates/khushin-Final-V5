import { WebSocket, WebSocketServer } from 'ws';
import { storage } from './storage';
import type { SessionData } from 'express-session';
import type { Server } from 'http';

interface AuthenticatedWebSocket extends WebSocket {
  isAlive: boolean;
  userId?: string;
  orderRef?: string;
  reconnectAttempts?: number;
}

interface ExtendedSessionData extends SessionData {
  passport?: {
    user: string;
  };
}

export function setupWebSocket(server: Server, sessionMiddleware: any) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  console.log('WebSocket server initialized');

  // Authenticate WebSocket connection using session
  wss.on('connection', async (ws: AuthenticatedWebSocket, req) => {
    console.log('New WebSocket connection attempt');

    try {
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

      // Check authentication
      if (!session?.passport?.user) {
        console.log('WebSocket connection rejected: No authenticated session');
        ws.close(1008, 'Authentication required');
        return;
      }

      // Extract order reference from URL if it exists
      const orderMatch = req.url?.match(/\/orders\/([^/?]+)/);
      const orderRef = orderMatch?.[1];

      // If this is an order-specific connection, verify access
      if (orderRef) {
        const order = await storage.getOrderByRef(orderRef);
        if (!order || order.userId.toString() !== session.passport.user.toString()) {
          console.log('WebSocket connection rejected: Unauthorized access to order');
          ws.close(1008, 'Unauthorized');
          return;
        }
        ws.orderRef = orderRef;
      }

      // Setup connection
      ws.isAlive = true;
      ws.userId = session.passport.user.toString();
      ws.reconnectAttempts = 0;

      console.log(`WebSocket connection established for user: ${ws.userId}${orderRef ? `, order: ${orderRef}` : ''}`);

      // Send initial connection status
      ws.send(JSON.stringify({ 
        type: 'connected',
        data: { userId: ws.userId }
      }));

      // Handle incoming messages
      ws.on('message', async (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          console.log('Received WebSocket message:', data);

          switch(data.type) {
            case 'ping':
              ws.send(JSON.stringify({ type: 'pong' }));
              break;
            case 'subscribe':
              if (data.orderRef) {
                const order = await storage.getOrderByRef(data.orderRef);
                if (order && order.userId.toString() === ws.userId) {
                  ws.orderRef = data.orderRef;
                  ws.send(JSON.stringify({ 
                    type: 'subscribed',
                    data: { orderRef: data.orderRef }
                  }));
                } else {
                  ws.send(JSON.stringify({ 
                    type: 'error',
                    message: 'Unauthorized access to order'
                  }));
                }
              }
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
        console.log(`WebSocket connection closed for user: ${ws.userId}`);
        ws.isAlive = false;
      });

    } catch (error) {
      console.error('WebSocket connection error:', error);
      ws.close(1011, 'Internal server error');
    }
  });

  // Ping clients periodically to check connection
  const interval = setInterval(() => {
    wss.clients.forEach((client: WebSocket) => {
      const ws = client as AuthenticatedWebSocket;
      if (!ws.isAlive) {
        console.log(`Terminating inactive WebSocket for user: ${ws.userId}`);
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