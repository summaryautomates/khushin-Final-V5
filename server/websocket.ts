import { Server } from 'http';
import WebSocket from 'ws';
import { parse } from 'url';
import { randomUUID } from 'crypto';

// Define client structure
interface Client {
  id: string;
  ws: WebSocket;
  isAlive: boolean;
  isAuthenticated: boolean;
  userId?: string;
}

// Setup WebSocket server
export async function setupWebSocket(server: Server, sessionMiddleware: any) {
  console.log('Setting up WebSocket server...');
  
  // Create WebSocket server
  const wss = new WebSocket.Server({ 
    server,
    path: '/ws',
    // Remove the token verification for now to simplify connection
    verifyClient: (info, cb) => {
      // Accept all connections for now
      cb(true);
    }
  });
  
  // Store connected clients
  const clients = new Map<string, Client>();
  
  // Handle connection
  wss.on('connection', (ws, req) => {
    const clientId = randomUUID();
    console.log(`WebSocket client connected: ${clientId}`);
    
    // Store client
    clients.set(clientId, {
      id: clientId,
      ws,
      isAlive: true,
      isAuthenticated: false
    });
    
    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connected',
      data: {
        clientId,
        isAuthenticated: false,
        timestamp: new Date().toISOString()
      }
    }));
    
    // Handle messages
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log(`Received message from client ${clientId}:`, data);
        
        // Handle ping messages to keep connection alive
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        }
      } catch (error) {
        console.error(`Error processing message from client ${clientId}:`, error);
      }
    });
    
    // Handle close
    ws.on('close', () => {
      console.log(`WebSocket client disconnected: ${clientId}`);
      clients.delete(clientId);
    });
    
    // Handle errors
    ws.on('error', (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
      clients.delete(clientId);
    });
  });
  
  // Setup heartbeat to detect dead connections
  // Add a small delay before starting heartbeat to allow server to stabilize
  const interval = setTimeout(() => {
    const heartbeatInterval = setInterval(() => {
      clients.forEach((client, id) => {
        if (!client.isAlive) {
          console.log(`Terminating inactive client: ${id}`);
          client.ws.terminate();
          // Explicitly nullify the client reference
          client.ws = null as any;
          clients.delete(id);
          return;
        }
        
        // Check readyState before sending ping to prevent operations on closed sockets
        if (client.ws.readyState === WebSocket.OPEN) {
          client.isAlive = false;
          client.ws.ping();
        } else {
          console.log(`Removing client with closed connection: ${id}`);
          clients.delete(id);
        }
      });
    }, 30000);
    
    // Store the heartbeat interval for cleanup
    wss.heartbeatInterval = heartbeatInterval;
  }, 1000);
  
  // Clean up on server close
  wss.on('close', () => {
    clearTimeout(interval);
    if (wss.heartbeatInterval) {
      clearInterval(wss.heartbeatInterval);
    }
  });
  
  console.log('WebSocket server setup complete');
  return wss;
}