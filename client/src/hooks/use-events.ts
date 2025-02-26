import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

export function useEvents() {
  const eventSourceRef = useRef<EventSource | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const connectSSE = () => {
      try {
        // Create EventSource connection
        const eventSource = new EventSource('/api/events', {
          withCredentials: true
        });

        eventSourceRef.current = eventSource;

        // Handle connection open
        eventSource.onopen = () => {
          console.log('SSE connection established');
        };

        // Handle incoming messages
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('SSE message received:', data);

            switch (data.type) {
              case 'order:created':
                // Invalidate orders cache
                queryClient.invalidateQueries(['/api/orders']);
                break;

              case 'error':
                toast({
                  title: "Error",
                  description: data.message,
                  variant: "destructive"
                });
                break;
            }
          } catch (error) {
            console.error('Error parsing SSE message:', error);
          }
        };

        // Handle errors
        eventSource.onerror = (error) => {
          console.error('SSE error:', error);
          eventSource.close();
          
          // Retry connection after delay
          setTimeout(connectSSE, 5000);
        };

      } catch (error) {
        console.error('Error creating SSE connection:', error);
      }
    };

    // Start connection
    connectSSE();

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [user, toast]);
}
