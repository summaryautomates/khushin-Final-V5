import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const maxReconnectAttempts = 5;
  const reconnectAttempts = useRef(0);
  const isMounted = useRef(true);
  const isReconnecting = useRef(false);

  const connect = () => {
    try {
      // Don't attempt to connect if already connecting
      if (isReconnecting.current) {
        console.log('Already attempting to reconnect...');
        return;
      }

      isReconnecting.current = true;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      console.log('Attempting WebSocket connection to:', wsUrl);

      // Create WebSocket with credentials
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      // Connection successful
      ws.onopen = () => {
        console.log('WebSocket connected successfully');
        isReconnecting.current = false;
        reconnectAttempts.current = 0;

        toast({
          title: "Connected",
          description: "Successfully connected to server",
          duration: 2000,
        });

        // Send initial ping
        try {
          ws.send(JSON.stringify({ type: 'ping' }));
        } catch (error) {
          console.error('Error sending initial ping:', error);
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);

          // Handle different message types
          switch (data.type) {
            case 'error':
              console.error('Server reported an error:', data.error);
              if (isMounted.current) {
                toast({
                  title: "Server Error",
                  description: data.error || "An error occurred",
                  variant: "destructive",
                });
              }
              break;

            case 'connected':
              console.log('Connection status:', data);
              if (!data.data.isAuthenticated) {
                console.warn('Connected but not authenticated');
                if (isMounted.current) {
                  toast({
                    title: "Authentication Required",
                    description: "Please log in to enable all features",
                    variant: "default",
                  });
                }
              }
              break;

            case 'pong':
              // Connection is alive, reset ping timeout
              break;

            default:
              console.log('Unhandled message type:', data.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        isReconnecting.current = false;

        if (isMounted.current) {
          handleReconnect();
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        isReconnecting.current = false;

        if (isMounted.current && event.code !== 1000 && event.code !== 1001) {
          handleReconnect();
        }
      };

      // Setup periodic ping to keep connection alive
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          try {
            ws.send(JSON.stringify({ type: 'ping' }));
          } catch (error) {
            console.error('Error sending ping:', error);
          }
        }
      }, 30000);

      // Clear ping interval on unmount
      return () => clearInterval(pingInterval);

    } catch (error) {
      console.error('WebSocket setup error:', error);
      isReconnecting.current = false;
      if (isMounted.current) {
        handleReconnect();
      }
    }
  };

  const handleReconnect = () => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.error('Maximum reconnection attempts reached');
      toast({
        title: "Connection Failed",
        description: "Unable to establish a connection after multiple attempts.",
        variant: "destructive",
      });
      return;
    }

    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectAttempts.current++;
    console.log(`Reconnecting (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})...`);

    // Exponential backoff with max delay of 30 seconds
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current - 1), 30000);

    reconnectTimeoutRef.current = setTimeout(() => {
      if (isMounted.current) {
        connect();
      }
    }, delay);
  };

  useEffect(() => {
    isMounted.current = true;
    console.log('Initializing WebSocket connection...');

    connect();

    // Handle network state changes
    const handleOnline = () => {
      console.log('Network online, attempting reconnect...');
      if (wsRef.current?.readyState !== WebSocket.OPEN) {
        connect();
      }
    };

    const handleOffline = () => {
      console.log('Network offline');
      toast({
        title: "Network Status",
        description: "You are offline. Reconnecting when network is available.",
        variant: "default",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      isMounted.current = false;
      isReconnecting.current = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounted');
      }
    };
  }, [toast]);

  return {
    send: (data: unknown) => {
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
    },
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    reconnect: () => {
      if (!isReconnecting.current) {
        reconnectAttempts.current = 0;
        connect();
      }
    }
  };
}