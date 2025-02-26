import { EventEmitter } from 'events';
import type { Response } from 'express';

class EventManager extends EventEmitter {
  private clients: Set<Response> = new Set();

  addClient(client: Response) {
    // Set up SSE headers
    client.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    // Add client to set
    this.clients.add(client);

    // Remove client when connection closes
    client.on('close', () => {
      this.clients.delete(client);
    });

    // Send initial connection success
    client.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);
  }

  broadcast(event: string, data: any) {
    const message = `data: ${JSON.stringify({ type: event, data })}\n\n`;
    this.clients.forEach(client => {
      try {
        client.write(message);
      } catch (error) {
        console.error('Error sending message to client:', error);
        this.clients.delete(client);
      }
    });
  }

  getConnectedClients() {
    return this.clients.size;
  }
}

export const eventManager = new EventManager();
