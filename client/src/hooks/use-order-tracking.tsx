import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

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
  const { user } = useAuth();
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  const connect = useCallback(() => {
    if (!orderRef || !user) return;

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/orders`;
    console.log('Attempting WebSocket connection:', wsUrl);

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsConnected(true);
      setReconnectAttempt(0);
      console.log('WebSocket connected successfully');

      // Send authentication and subscription in one message
      ws.send(JSON.stringify({
        type: 'SUBSCRIBE_ORDER',
        orderRef,
        auth: {
          userId: user.id,
          sessionId: document.cookie.match(/connect\.sid=([^;]+)/)?.[1] || ''
        }
      }));
    };

    ws.onmessage = (event) => {
      try {
        const update: OrderUpdate = JSON.parse(event.data);
        console.log('Received WebSocket message:', update);

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
            console.error('WebSocket error message:', update.message);
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

    ws.onclose = (event) => {
      console.log('WebSocket closed:', event);
      setIsConnected(false);
      setSocket(null);

      if (!event.wasClean) {
        toast({
          title: 'Connection Lost',
          description: 'Lost connection to order tracking service. Retrying...',
          variant: 'destructive',
        });

        // Implement exponential backoff for reconnection
        if (reconnectAttempt < MAX_RECONNECT_ATTEMPTS) {
          const timeout = Math.min(1000 * Math.pow(2, reconnectAttempt), 10000);
          setTimeout(() => {
            setReconnectAttempt(prev => prev + 1);
            connect();
          }, timeout);
        } else {
          toast({
            title: 'Connection Failed',
            description: 'Unable to connect to order tracking service. Please refresh the page.',
            variant: 'destructive',
          });
        }
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: "Connection Error",
        description: "Error connecting to order tracking. Retrying...",
        variant: "destructive"
      });
    };

    setSocket(ws);

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [orderRef, toast, user, reconnectAttempt]);

  useEffect(() => {
    const cleanup = connect();
    return () => {
      if (cleanup) cleanup();
    };
  }, [connect]);

  return {
    status,
    isConnected
  };
}