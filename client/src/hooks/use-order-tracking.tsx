import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth.tsx';
import { useWebSocket } from '@/lib/websocket';

export function useOrderTracking(orderRef: string | null) {
  const [status, setStatus] = useState<string | null>("pending");
  const { toast } = useToast();
  const { user } = useAuth(); 
  const { send, isConnected, reconnect } = useWebSocket();
  
  // Check if we're in a deployment environment
  const isDeployment = !window.location.hostname.includes('localhost') && 
                      !window.location.hostname.includes('127.0.0.1');

  useEffect(() => {
    // For deployments, use a mock status with simulated changes
    if (isDeployment) {
      // Simulate order status changes for demo purposes
      setStatus('pending');
      
      // Simulate status changes after delays
      const processingTimer = setTimeout(() => {
        setStatus('processing');
      }, 5000);
      
      const shippedTimer = setTimeout(() => {
        setStatus('shipped');
      }, 10000);
      
      const completedTimer = setTimeout(() => {
        setStatus('completed');
      }, 15000); 
      
      return () => {
        clearTimeout(processingTimer);
        clearTimeout(shippedTimer);
        clearTimeout(completedTimer);
      };
      return;
    } 

    if (!orderRef) return;
    
    // Skip WebSocket connection in deployment environments
    if (isDeployment) return;

    // Subscribe to order updates when connected
    if (isConnected) {
      try {
        const subscribed = send({
          type: 'subscribe', 
          data: { orderRef }
        });
        console.log('Subscribed to order updates for:', orderRef);
  
        if (!subscribed) {
          console.warn('Failed to send subscription message');
        }
      } catch (error) { 
        console.error('Error subscribing to order updates:', error);
      }
    }
    
    // If not connected, try to reconnect
    if (!isConnected) {
      console.log('WebSocket not connected, attempting to reconnect...');
      reconnect(); 
    }

    // Set up message handler for this specific order
    const handleMessage = (event: MessageEvent) => {
      try {
        // Safely parse the message data
        let data;
        try { 
          if (typeof event.data === 'string') {
            data = JSON.parse(event.data);
          } else {
            return; // Skip non-string data
          }
        } catch (parseError) {
          console.error('Error parsing message data:', parseError);
          return;
        }

        switch (data.type) { 
          case 'connected':
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
    
    // Set a default status after a delay if none is received 
    const defaultStatusTimer = setTimeout(() => {
      if (status === null) {
        setStatus('pending');
      }
    }, 3000);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(defaultStatusTimer);

      // Unsubscribe from order updates if connected
      if (isConnected) {
        try { 
          send({
            type: 'unsubscribe',
            data: { orderRef }
          });
        } catch (error) {
          console.error('Error unsubscribing from order updates:', error);
        }
      }
    };
  }, [orderRef, isConnected, send, toast, user, reconnect, status]);

  return {
    status,
    isConnected
  };
}