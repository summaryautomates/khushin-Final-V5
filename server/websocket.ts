import { WebSocket, WebSocketServer } from 'ws';
import { storage } from './storage';
import type { Session } from 'express-session';
import type { Server } from 'http';

interface AuthenticatedWebSocket extends WebSocket {
  isAlive: boolean;
  userId?: string;
  orderRef?: string;
  reconnectAttempts?: number;
}

export function setupWebSocket(server: Server, sessionMiddleware: any) {
  const wss = new WebSocketServer({ server, path: '/ws/orders' });
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
          }
          resolve(undefined);
        });
      });

      const session = (req as any).session as Session;
      if (!session?.passport?.user) {
        console.log('WebSocket connection rejected: No authenticated session');
        ws.close(1008, 'Authentication required');
        return;
      }

      // Extract order reference from URL
      const match = req.url?.match(/\/ws\/orders\/([^/]+)/);
      const orderRef = match?.[1];
      if (!orderRef) {
        console.log('WebSocket connection rejected: Missing order reference');
        ws.close(1008, 'Invalid order reference');
        return;
      }

      // Verify order belongs to user
      const order = await storage.getOrderByRef(orderRef);
      if (!order || order.userId.toString() !== session.passport.user.toString()) {
        console.log('WebSocket connection rejected: Unauthorized access to order');
        ws.close(1008, 'Unauthorized');
        return;
      }

      ws.isAlive = true;
      ws.userId = session.passport.user.toString();
      ws.orderRef = orderRef;
      ws.reconnectAttempts = 0;

      console.log(`WebSocket connection established for order: ${orderRef}`);

      // Send initial order status
      ws.send(JSON.stringify({ 
        type: 'status',
        data: { status: order.status }
      }));

      // Handle incoming messages
      ws.on('message', async (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          console.log('Received WebSocket message:', data);

          // Handle different message types
          switch(data.type) {
            case 'ping':
              ws.send(JSON.stringify({ type: 'pong' }));
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
        console.log(`WebSocket connection closed for order: ${orderRef}`);
        ws.isAlive = false;
      });

    } catch (error) {
      console.error('WebSocket connection error:', error);
      ws.close(1011, 'Internal server error');
    }
  });

  // Ping clients periodically to check connection
  const interval = setInterval(() => {
    wss.clients.forEach((ws: AuthenticatedWebSocket) => {
      if (!ws.isAlive) {
        console.log(`Terminating inactive WebSocket for order: ${ws.orderRef}`);
        ws.terminate();
        return;
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