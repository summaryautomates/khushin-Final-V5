import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export function useOrderTracking(orderRef: string | null) {
  const [status, setStatus] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!orderRef || !user) return;

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.host;
    const ws = new WebSocket(`${wsProtocol}//${wsHost}/ws/orders/${orderRef}`);

    ws.onopen = () => {
      console.log('WebSocket connection established');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.status) {
          setStatus(data.status);
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
        description: 'Failed to connect to order tracking. Please refresh the page.',
        variant: 'destructive',
      });
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setIsConnected(false);
    };

    // Regular polling fallback if WebSocket fails
    const pollInterval = setInterval(async () => {
      if (!isConnected) {
        try {
          const response = await fetch(`/api/orders/${orderRef}`);
          if (!response.ok) {
            throw new Error('Failed to fetch order status');
          }
          const data = await response.json();
          setStatus(data.status);
        } catch (error) {
          console.error('Error fetching order status:', error);
        }
      }
    }, 10000); // Poll every 10 seconds when WebSocket is not connected

    return () => {
      ws.close();
      clearInterval(pollInterval);
    };
  }, [orderRef, user, toast, isConnected]);

  return {
    status,
    isConnected
  };
}