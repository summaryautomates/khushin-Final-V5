import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useWebSocket } from '@/lib/websocket';

export function useOrderTracking(orderRef: string | null) {
  const [status, setStatus] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { send, isConnected } = useWebSocket();

  useEffect(() => {
    if (!orderRef) return;

    // Subscribe to order updates when connected
    if (isConnected) {
      const subscribed = send({
        type: 'subscribe',
        data: { orderRef }
      });

      if (!subscribed) {
        toast({
          title: 'Connection Error',
          description: 'Unable to subscribe to order updates. Please refresh the page.',
          variant: 'destructive',
        });
      }
    }

    // Set up message handler for this specific order
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'status':
            if (data.data?.orderRef === orderRef && data.data?.status) {
              setStatus(data.data.status);
            }
            break;
          case 'error':
            if (data.data?.orderRef === orderRef) {
              toast({
                title: 'Order Update Error',
                description: data.message,
                variant: 'destructive',
              });
            }
            break;
        }
      } catch (error) {
        console.error('Error handling order tracking message:', error);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);

      // Unsubscribe from order updates if connected
      if (isConnected) {
        send({
          type: 'unsubscribe',
          data: { orderRef }
        });
      }
    };
  }, [orderRef, isConnected, send, toast, user]);

  return {
    status,
    isConnected
  };
}