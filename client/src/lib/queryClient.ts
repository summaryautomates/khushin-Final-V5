import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Helper function for making API requests
export async function apiRequest(
  endpoint: string,
  { method = 'GET', body }: { method?: string; body?: any } = {}
) {
  try {
    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for sessions
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// Default query function that uses apiRequest
const defaultQueryFn: QueryFunction = async ({ queryKey }) => {
  const [endpoint] = queryKey;
  try {
    return await apiRequest(endpoint as string);
  } catch (error) {
    console.error('Query function error:', error);
    throw error;
  }
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      retry: 1,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: 1,
      onError: (error: Error) => {
        console.error('Mutation error:', error);
      }
    }
  }
});