
import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const maxReconnectAttempts = 5;
  const reconnectAttempts = useRef(0);
  const connectTimeoutRef = useRef<NodeJS.Timeout>();
  const isMounted = useRef(true);

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
          console.log('WebSocket connection timeout');
          ws.close();
          
          if (isMounted.current) {
            handleReconnect(new Error('Connection timeout'));
          }
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
          
          // Handle different message types here if needed
          if (data.type === 'error') {
            console.error('Server reported an error:', data.error);
            toast({
              title: "Server Error",
              description: data.error || "An error occurred",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        if (isMounted.current) {
          toast({
            title: "Connection Error",
            description: "There was an error with the WebSocket connection.",
            variant: "destructive",
          });
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        
        if (isMounted.current) {
          // Only attempt to reconnect if the closure wasn't clean/intentional
          if (event.code !== 1000 && event.code !== 1001) {
            handleReconnect(new Error(`Connection closed (${event.code}): ${event.reason || 'No reason provided'}`));
          }
        }
      };
    } catch (error) {
      console.error('WebSocket setup error:', error);
      if (isMounted.current) {
        handleReconnect(error instanceof Error ? error : new Error('Failed to setup WebSocket'));
      }
    }
  };

  const handleReconnect = (error: Error) => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.error('Maximum reconnection attempts reached:', error);
      toast({
        title: "Connection Failed",
        description: "Unable to establish a connection after multiple attempts.",
        variant: "destructive",
      });
      return;
    }

    reconnectAttempts.current++;
    console.log(`Reconnecting (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})...`);
    
    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current - 1), 30000);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      if (isMounted.current) {
        connect();
      }
    }, delay);
  };

  const handleOnline = () => {
    console.log('Device came online, attempting to reconnect...');
    if (wsRef.current?.readyState !== WebSocket.OPEN) {
      connect();
    }
  };

  const handleOffline = () => {
    console.log('Device went offline, WebSocket connections will fail');
    toast({
      title: "Offline",
      description: "You appear to be offline. Some features may be unavailable.",
      variant: "default",
    });
  };

  useEffect(() => {
    isMounted.current = true;
    console.log('Initializing WebSocket connection...');
    
    connect();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      isMounted.current = false;
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
