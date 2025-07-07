import { useEffect, useRef, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0); 
  const maxReconnectAttempts = 10; // Increased from 5 to 10
  const reconnectTimeouts = [1000, 2000, 3000, 5000, 8000, 13000, 21000, 30000, 30000, 30000]; // Fibonacci-like sequence
  const keepAliveIntervalRef = useRef<number | null>(null);
  const { toast } = useToast();

  const connect = useCallback(() => {
    console.log('Initializing WebSocket connection...');

    // Set a flag to prevent multiple connection attempts
    if (wsRef.current && (wsRef.current.readyState === WebSocket.CONNECTING || wsRef.current.readyState === WebSocket.OPEN)) {
      console.log('WebSocket connection already exists, not creating a new one');
      return;
    }
    
    // Clear any existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      // Determine the WebSocket URL
      // Determine the WebSocket URL based on environment
      let wsUrl: string;

      // For Netlify deployments, we need to disable WebSockets since they won't work
      if (window.location.hostname.includes('netlify.app')) {
        console.log('WebSocket disabled on Netlify deployment');
        // Return early without creating a WebSocket
        setConnected(false);
        return;
      } else if (window.location.hostname === 'localhost' || window.location.hostname.includes('webcontainer')) {
        // Development environment - use current host for webcontainer, localhost:5000 for local dev
        if (window.location.hostname.includes('webcontainer')) {
          // In webcontainer, use ws protocol on port 5000 where the server is listening
          wsUrl = `ws://${window.location.hostname}:5000/ws`;
        } else {
          // Local development - connect directly to port 5000
          wsUrl = `ws://localhost:5000/ws`;
        }
      } else {
        // Production environment - use current host
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        wsUrl = `${protocol}//${host}/ws`;
      }
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws; 
      
      // Connection established
      ws.onopen = () => {
        console.log('WebSocket connected successfully');
        setConnected(true);
        reconnectAttemptRef.current = 0;
        
        // Start keep-alive ping
        if (keepAliveIntervalRef.current) {
          clearInterval(keepAliveIntervalRef.current);
        }

        keepAliveIntervalRef.current = window.setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);
      };
      
      // Message received
      ws.onmessage = (event) => {
        try {
          // Ensure we're parsing string data properly
          let data;
          if (typeof event.data === 'string') {
            try {
              data = JSON.parse(event.data);
            } catch (parseError) {
              console.error('Error parsing WebSocket message:', parseError);
              return;
            }
          } else {
            // For non-string data (rare in WebSocket), try to handle it
            try {
              data = JSON.parse(event.data.toString());
            } catch (parseError) {
              console.error('Error parsing non-string WebSocket message:', parseError);
              return;
            }
          }
          console.log('WebSocket message received:', data);
          
          if (data.type === 'connected') {
            setAuthenticated(data.data?.isAuthenticated || false);
          }
          
          // Handle other message types here
          if (data.type === 'pong') {
            console.log('Received pong from server');
          }
          
          // Dispatch a custom event that other components can listen for
          window.dispatchEvent(new MessageEvent('message', { 
            data,
            origin: window.location.origin
          }));
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      // Connection closed
      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason || 'No reason provided');
        setConnected(false);
        
        // Clear keep-alive interval
        if (keepAliveIntervalRef.current) {
          clearInterval(keepAliveIntervalRef.current);
          keepAliveIntervalRef.current = null;
        }
        
        // Attempt to reconnect if not a normal closure (1000 or 1001)
        if (event.code !== 1000 && event.code !== 1001) {
          attemptReconnect();
        }
      };
      
      // Error handling
      ws.onerror = (error) => {
        console.error('WebSocket error occurred');
        // Don't need to do anything here as onclose will be called
      };
      
    } catch (error) {
      console.error('WebSocket setup error:', error);
      attemptReconnect();
    }
  }, []);
  
  const attemptReconnect = useCallback(() => {
    if (reconnectAttemptRef.current >= maxReconnectAttempts) {
      console.error('Maximum WebSocket reconnection attempts reached');
      toast({
        title: 'WebSocket Connection Error',
        description: 'Unable to establish a stable connection. Please refresh the page.',
        variant: 'destructive',
      });
      return;
    }
    
    const timeout = reconnectTimeouts[reconnectAttemptRef.current] || 30000;
    console.log(`Attempting to reconnect WebSocket in ${timeout}ms (attempt ${reconnectAttemptRef.current + 1}/${maxReconnectAttempts})`);
    
    setTimeout(() => {
      console.log(`Reconnecting (attempt ${reconnectAttemptRef.current + 1}/${maxReconnectAttempts})...`);
      reconnectAttemptRef.current++;
      connect();
    }, timeout);
  }, [connect, toast]);
  
  useEffect(() => {
    setTimeout(connect, 1000); // Delay initial connection by 1 second to allow server to start
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounted');
      }
      
      if (keepAliveIntervalRef.current) {
        clearInterval(keepAliveIntervalRef.current);
      }
    };
  }, [connect]);
  
  // Expose a function to send messages through the WebSocket
  const sendMessage = useCallback((data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, []);
  
  return {
    isConnected: connected,
    authenticated,
    send: sendMessage,
    reconnect: connect
  };
}