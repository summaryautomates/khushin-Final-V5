import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/user'],
    queryFn: () => apiRequest('/api/user'),
    // Don't retry too many times, as this is called on every page
    retry: 1,
    // Keep previous data to prevent UI flashing
    keepPreviousData: true,
    // No stale time so we always get fresh data
    staleTime: 0,
    // Don't refetch on window focus - let other mutations trigger refetches
    refetchOnWindowFocus: false
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error
  };
}
