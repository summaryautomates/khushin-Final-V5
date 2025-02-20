import { QueryClient } from "@tanstack/react-query";

// Helper function for making API requests
export async function apiRequest(
  endpoint: string,
  { method = 'POST', body }: { method?: string; body?: any } = {}
) {
  const response = await fetch(endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      onError: (error: unknown) => {
        console.error('Query error:', error);
      }
    },
    mutations: {
      retry: 1,
      onError: (error: unknown) => {
        console.error('Mutation error:', error);
      }
    }
  }
});