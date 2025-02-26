import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const maxReconnectAttempts = 5;
  let reconnectAttempts = 0;

  const connect = () => {
    try {
      // Force connection to port 5000
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.hostname}:5000/ws`;

      console.log('Attempting WebSocket connection to:', wsUrl, {
        protocol,
        hostname: window.location.hostname,
        cookies: document.cookie,
        timestamp: new Date().toISOString()
      });

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected successfully');
        reconnectAttempts = 0; // Reset attempts on successful connection
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);

          if (data.type === 'error') {
            toast({
              title: "Error",
              description: data.message,
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', {
          event,
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          timestamp: new Date().toISOString()
        });
        wsRef.current = null;

        // Only attempt reconnect if it's not an intentional close
        if (event.code !== 1000 && !window.navigator.onLine) {
          console.log('Network is offline, will retry when online');
          return;
        }

        // Try to reconnect with exponential backoff, unless closed intentionally
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
          console.log(`Attempting reconnect in ${timeout}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts++;
            connect();
          }, timeout);
        } else if (reconnectAttempts >= maxReconnectAttempts) {
          console.warn('Max reconnection attempts reached');
          // Don't show toast for intentional closes
          if (event.code !== 1000) {
            toast({
              title: "Connection Lost",
              description: "Unable to maintain connection to server. Please refresh the page.",
              variant: "destructive"
            });
          }
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      // Listen for online/offline events
      window.addEventListener('online', connect);
      window.addEventListener('offline', () => {
        if (wsRef.current) {
          wsRef.current.close(1000, 'Network offline');
        }
      });

    } catch (error) {
      console.error('Error creating WebSocket:', error);
      // Don't block app rendering on connection error
    }
  };

  useEffect(() => {
    connect();

    return () => {
      // Cleanup on unmount
      window.removeEventListener('online', connect);
      window.removeEventListener('offline', () => {});

      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounted');
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const send = (data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not ready, message not sent:', data);
    }
  };

  return { send };
}