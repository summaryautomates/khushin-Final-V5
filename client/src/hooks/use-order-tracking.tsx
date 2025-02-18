import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface OrderUpdate {
  type: 'ORDER_STATUS_UPDATE' | 'SUBSCRIPTION_CONFIRMED' | 'CONNECTED' | 'ERROR';
  orderRef?: string;
  status?: string;
  message?: string;
  timestamp: string;
}

export function useOrderTracking(orderRef: string | null) {
  const [status, setStatus] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const { toast } = useToast();

  const connect = useCallback(() => {
    if (!orderRef) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsConnected(true);
      // Subscribe to order updates
      ws.send(JSON.stringify({
        type: 'SUBSCRIBE_ORDER',
        orderRef
      }));
    };

    ws.onmessage = (event) => {
      try {
        const update: OrderUpdate = JSON.parse(event.data);

        switch (update.type) {
          case 'ORDER_STATUS_UPDATE':
            setStatus(update.status || null);
            toast({
              title: 'Order Status Updated',
              description: `Order ${update.orderRef} status: ${update.status}`,
            });
            break;

          case 'SUBSCRIPTION_CONFIRMED':
            toast({
              title: 'Order Tracking Active',
              description: `Now tracking order ${update.orderRef}`,
            });
            break;

          case 'CONNECTED':
            toast({
              title: 'Connected',
              description: update.message,
            });
            break;

          case 'ERROR':
            toast({
              title: 'Error',
              description: update.message,
              variant: 'destructive',
            });
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      toast({
        title: 'Disconnected',
        description: 'Lost connection to order tracking service',
        variant: 'destructive',
      });

      // Attempt to reconnect after 5 seconds
      setTimeout(connect, 5000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: "Connection Error",
        description: "Lost connection to order tracking. Retrying...",
        variant: "destructive"
      });
      setTimeout(connect, 5000); // Retry after 5 seconds
    };

    setSocket(ws);

    // Cleanup function
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [orderRef, toast, connect]);

  useEffect(() => {
    const cleanup = connect();
    return () => {
      cleanup?.();
    };
  }, [connect]);

  return {
    status,
    isConnected
  };
}