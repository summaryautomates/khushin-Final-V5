import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export function useOrderTracking(orderRef: string | null) {
  const [status, setStatus] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // For now, we'll use a simple polling mechanism
  const fetchOrderStatus = async () => {
    if (!orderRef || !user) return;

    try {
      const response = await fetch(`/api/orders/${orderRef}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order status');
      }
      const data = await response.json();
      setStatus(data.status);
    } catch (error) {
      console.error('Error fetching order status:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch order status. Please refresh the page.',
        variant: 'destructive',
      });
    }
  };

  return {
    status,
    isConnected: false // Always false since we're not using WebSocket
  };
}