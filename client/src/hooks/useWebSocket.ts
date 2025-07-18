import { useEffect, useRef, useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

export function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeouts = [2000, 4000, 8000, 16000, 30000];
  const keepAliveIntervalRef = useRef<number | null>(null);
  const { toast } = useToast();

  const connect = useCallback(() => {
    console.log('Initializing WebSocket connection...');
    
    // Clear any existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Determine the WebSocket URL based on environment
    let wsUrl: string;
    
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // Local development - use the current host
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      wsUrl = `${protocol}//${window.location.host}/ws`;
    } else {
      // Production or WebContainer environment - use current host with appropriate protocol
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      wsUrl = `${protocol}//${window.location.host}/ws`;
    }
    
    console.log('Attempting WebSocket connection to:', wsUrl);
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      // Connection established
      ws.onopen = () => {
        console.log('WebSocket connected successfully');
        setConnected(true);
        toast({
          title: "Connected",
          description: "WebSocket connection established",
          variant: "default",
        });
        reconnectAttemptRef.current = 0;
        
        // Set up keep-alive ping
        if (keepAliveIntervalRef.current) {
          clearInterval(keepAliveIntervalRef.current);
        }
        
        keepAliveIntervalRef.current = window.setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 20000);
      };
      
      // Message received
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          
          if (data.type === 'connected') {
            setAuthenticated(data.data?.isAuthenticated || false);
          }
          
          // Handle other message types here
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      // Connection closed
      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        if (connected) {
          toast({
            title: "Disconnected",
            description: "WebSocket connection closed",
            variant: "destructive",
          });
        }
        setConnected(false);
        
        // Clear keep-alive interval
        if (keepAliveIntervalRef.current) {
          clearInterval(keepAliveIntervalRef.current);
          keepAliveIntervalRef.current = null;
        }
        
        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && event.code !== 1001) {
          attemptReconnect();
        }
      };
      
      // Error handling
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        // Don't need to do anything here as onclose will be called
      };
      
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      attemptReconnect();
    }
  }, [toast]);
  
  const attemptReconnect = useCallback(() => {
    if (reconnectAttemptRef.current >= maxReconnectAttempts) {
      console.error('Maximum WebSocket reconnection attempts reached');
      toast({
        title: 'Connection Error',
        description: 'Unable to establish a stable connection. Please refresh the page.',
        variant: 'destructive',
      });
      return;
    }
    
    const timeout = reconnectTimeouts[reconnectAttemptRef.current] || 30000;
    console.log(`Attempting to reconnect in ${timeout}ms (attempt ${reconnectAttemptRef.current + 1}/${maxReconnectAttempts})`);
    
    setTimeout(() => {
      console.log(`Reconnecting (attempt ${reconnectAttemptRef.current + 1}/${maxReconnectAttempts})...`);
      reconnectAttemptRef.current += 1;
      connect();
    }, timeout);
  }, [connect, toast]);
  
  useEffect(() => {
    connect();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      
      if (keepAliveIntervalRef.current) {
        clearInterval(keepAliveIntervalRef.current);
        keepAliveIntervalRef.current = null;
      }
    };
  }, [connect]);
  
  return {
    connected,
    authenticated,
    sendMessage: useCallback((data: any) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(data));
        return true;
      }
      return false;
    }, [])
  };
}