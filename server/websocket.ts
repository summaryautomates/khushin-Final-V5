import { WebSocket, WebSocketServer } from 'ws';
import { storage } from './storage';
import type { Session } from 'express-session';
import type { Server } from 'http';

interface AuthenticatedWebSocket extends WebSocket {
  isAlive: boolean;
  userId?: string;
  orderRef?: string;
}

export function setupWebSocket(server: Server, sessionMiddleware: any) {
  const wss = new WebSocketServer({ server, path: '/ws/orders' });

  // Authenticate WebSocket connection using session
  wss.on('connection', async (ws: AuthenticatedWebSocket, req) => {
    try {
      // Apply session middleware to WebSocket request
      await new Promise((resolve, reject) => {
        sessionMiddleware(req, {}, (err: Error) => {
          if (err) reject(err);
          resolve(undefined);
        });
      });

      const session = (req as any).session as Session;
      if (!session?.passport?.user) {
        ws.close(1008, 'Authentication required');
        return;
      }

      // Extract order reference from URL
      const match = req.url?.match(/\/ws\/orders\/([^/]+)/);
      const orderRef = match?.[1];
      if (!orderRef) {
        ws.close(1008, 'Invalid order reference');
        return;
      }

      // Verify order belongs to user
      const order = await storage.getOrderByRef(orderRef);
      if (!order || order.userId.toString() !== session.passport.user.toString()) {
        ws.close(1008, 'Unauthorized');
        return;
      }

      ws.isAlive = true;
      ws.userId = session.passport.user.toString();
      ws.orderRef = orderRef;

      // Send initial order status
      ws.send(JSON.stringify({ status: order.status }));

      // Handle pings to keep connection alive
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      // Clean up on close
      ws.on('close', () => {
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
