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
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });

    // Handle 401 Unauthorized without throwing an error
    if (response.status === 401) {
      return null;
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        console.warn('Network error detected, will retry:', error.message);
        throw new Error('NetworkError');
      }
      console.error('API request error:', error.message);
    }
    throw error;
  }
}

// Default query function that uses apiRequest
const defaultQueryFn: QueryFunction = async ({ queryKey, signal }) => {
  const [endpoint] = queryKey;
  try {
    return await apiRequest(endpoint as string);
  } catch (error) {
    if (error instanceof Error && error.message === 'NetworkError') {
      // Allow retry for network errors
      throw error;
    }
    console.error('Query function error:', error);
    throw error;
  }
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      retry: (failureCount, error: any) => {
        // Don't retry auth-related errors
        if (error?.response?.status === 401) return false;
        // Retry network errors up to 3 times
        if (error?.message === 'NetworkError') return failureCount < 3;
        // Default to 2 retries for other errors
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true, // Enable refetch on reconnect
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Retry network errors up to 2 times for mutations
        if (error?.message === 'NetworkError') return failureCount < 2;
        return false; // Don't retry other errors
      },
      onError: (error: Error) => {
        console.error('Mutation error:', error.message);
      }
    }
  }
});