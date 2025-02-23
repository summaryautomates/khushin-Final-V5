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
      throw new Error(error.message || `API request failed: ${response.status}`);
    }

    const data = await response.json().catch(() => null);
    return data;
  } catch (error) {
    console.error('API request error:', error);
    // Return null for network errors to prevent unhandled rejections
    if (error instanceof Error && 
       (error.message.includes('Failed to fetch') || 
         error.message.includes('NetworkError'))) {
      return null;
    }
    throw error;
  }
}

// Default query function that uses apiRequest
const defaultQueryFn: QueryFunction = async ({ queryKey }) => {
  const [endpoint] = queryKey;
  try {
    const data = await apiRequest(endpoint as string);
    return data;
  } catch (error) {
    console.error('Query function error:', error);
    return null; // Return null instead of throwing to prevent unhandled rejections
  }
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 401) return false;
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      throwOnError: (error) => error?.message?.includes('FATAL:')
    },
    mutations: {
      retry: false,
      onError: (error: Error) => {
        console.error('Mutation error:', error.message);
      }
    }
  }
});