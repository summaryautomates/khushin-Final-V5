import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const maxReconnectAttempts = 5;
  const reconnectAttempts = useRef(0);
  const connectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = () => {
    try {
      // Clear any existing connection timeouts
      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current);
      }

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      console.log('Attempting WebSocket connection to:', wsUrl);

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      // Set connection timeout
      connectTimeoutRef.current = setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          ws.close();
          throw new Error('Connection timeout');
        }
      }, 5000);

      ws.onopen = () => {
        console.log('WebSocket connected successfully');
        reconnectAttempts.current = 0;
        if (connectTimeoutRef.current) {
          clearTimeout(connectTimeoutRef.current);
        }
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
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });

        wsRef.current = null;

        // Clear any existing timeouts
        if (connectTimeoutRef.current) {
          clearTimeout(connectTimeoutRef.current);
        }
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        // Only attempt reconnect if it's not an intentional close
        if (event.code !== 1000) {
          if (!window.navigator.onLine) {
            console.log('Network is offline, will retry when online');
            return;
          }

          if (reconnectAttempts.current < maxReconnectAttempts) {
            const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
            console.log(`Attempting reconnect in ${timeout}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);

            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttempts.current += 1;
              connect();
            }, timeout);
          } else {
            console.warn('Max reconnection attempts reached');
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
        if (ws.readyState === WebSocket.CONNECTING) {
          ws.close();
        }
      };

    } catch (error) {
      console.error('Error creating WebSocket:', error);
      toast({
        title: "Connection Error",
        description: "Failed to establish WebSocket connection. Please refresh the page.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    connect();

    // Setup online/offline handlers
    const handleOnline = () => {
      console.log('Network is online, attempting to reconnect');
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        reconnectAttempts.current = 0; // Reset attempts when coming back online
        connect();
      }
    };

    const handleOffline = () => {
      console.log('Network is offline');
      if (wsRef.current) {
        wsRef.current.close(1000, 'Network offline');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);

      // Cleanup all timeouts
      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounted');
      }
    };
  }, [toast]);

  const send = (data: unknown) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not ready, message not sent:', data);
      return false;
    }
    try {
      wsRef.current.send(JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  };

  return { 
    send,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN 
  };
}