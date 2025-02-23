import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export function useOrderTracking(orderRef: string | null) {
  const [status, setStatus] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!orderRef) return;

    // Always use port 5000 for WebSocket connections
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.hostname + ':5000';
    const ws = new WebSocket(`${wsProtocol}//${wsHost}/ws`);

    let pingInterval: NodeJS.Timeout;
    let reconnectTimeout: NodeJS.Timeout;
    let reconnectAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 5;
    const RECONNECT_DELAY = 3000;

    const connect = () => {
      ws.onopen = () => {
        console.log('WebSocket connection established');
        setIsConnected(true);
        reconnectAttempts = 0;

        // Subscribe to order updates
        ws.send(JSON.stringify({
          type: 'subscribe',
          data: { orderRef }
        }));

        // Start ping interval
        pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 25000); // Ping every 25 seconds
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);

          switch (data.type) {
            case 'connected':
              console.log('WebSocket connection authenticated:', data);
              if (!data.data.isAuthenticated && user) {
                toast({
                  title: 'Authentication Warning',
                  description: 'WebSocket connection is not authenticated. Please refresh the page.',
                  variant: 'destructive',
                });
              }
              break;
            case 'subscribed':
              console.log('WebSocket subscription confirmed:', data);
              break;
            case 'status':
              if (data.data?.status) {
                setStatus(data.data.status);
              }
              break;
            case 'error':
              console.error('WebSocket error:', data.message);
              toast({
                title: 'Connection Error',
                description: data.message,
                variant: 'destructive',
              });
              break;
            case 'pong':
              // Connection is alive, no action needed
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);

        toast({
          title: 'Connection Error',
          description: 'Failed to connect to order tracking service',
          variant: 'destructive',
        });
      };

      ws.onclose = (event) => {
        console.log('WebSocket connection closed. Code:', event.code, 'Reason:', event.reason);
        setIsConnected(false);
        clearInterval(pingInterval);

        // Attempt to reconnect if closure wasn't intentional
        if (event.code !== 1000 && event.code !== 1001 && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++;
          console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
          reconnectTimeout = setTimeout(() => {
            connect();
          }, RECONNECT_DELAY * reconnectAttempts);
        } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
          toast({
            title: 'Connection Lost',
            description: 'Unable to reconnect to order tracking. Please refresh the page.',
            variant: 'destructive',
          });
        }
      };
    };

    connect();

    // Cleanup function
    return () => {
      clearInterval(pingInterval);
      clearTimeout(reconnectTimeout);
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close(1000, 'Component unmounted');
      }
    };
  }, [orderRef, user, toast]);

  return {
    status,
    isConnected
  };
}