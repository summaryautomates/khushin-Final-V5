import { createContext, ReactNode, useContext, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { type User as SelectUser, type InsertUser } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthContextType {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: ReturnType<typeof useLoginMutation>;
  logoutMutation: ReturnType<typeof useLogoutMutation>;
  registerMutation: ReturnType<typeof useRegisterMutation>;
  guestLoginMutation: ReturnType<typeof useGuestLoginMutation>;
  isGuest: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function useLoginMutation() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      try {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
          body: JSON.stringify(credentials),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || "Login failed");
        }

        return res.json() as Promise<SelectUser>;
      } catch (error) {
        console.error('Login request failed:', error);
        throw error;
      }
    },
    onError: (error: Error) => {
      console.error('Login mutation error:', error);
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again",
        variant: "destructive",
      });
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Welcome back!",
        description: "Successfully logged in",
      });
    },
  });
}

function useRegisterMutation() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (userData: InsertUser) => {
      try {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
          body: JSON.stringify(userData),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || "Registration failed");
        }

        return res.json() as Promise<SelectUser>;
      } catch (error) {
        console.error('Registration request failed:', error);
        throw error;
      }
    },
    onError: (error: Error) => {
      console.error('Registration mutation error:', error);
      toast({
        title: "Registration failed",
        description: error.message || "Please try again with different credentials",
        variant: "destructive",
      });
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Welcome!",
        description: "Account created successfully",
      });
    },
  });
}

function useLogoutMutation() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/logout", { 
          method: "POST",
          credentials: 'include'
        });

        if (!res.ok) {
          throw new Error("Logout failed");
        }
      } catch (error) {
        console.error('Logout request failed:', error);
        throw error;
      }
    },
    onError: (error: Error) => {
      console.error('Logout mutation error:', error);
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      queryClient.clear();
      toast({
        title: "Logged out",
        description: "Successfully logged out",
      });
    },
  });
}

function useGuestLoginMutation() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/guest-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || "Guest login failed");
        }

        return res.json() as Promise<SelectUser>;
      } catch (error) {
        console.error('Guest login request failed:', error);
        throw error;
      }
    },
    onError: (error: Error) => {
      console.error('Guest login mutation error:', error);
      toast({
        title: "Guest login failed",
        description: error.message || "Unable to create guest account",
        variant: "destructive",
      });
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Welcome, Guest!",
        description: "You're now browsing as a guest user",
      });
    },
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user = null, error, isLoading } = useQuery<SelectUser | null>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/user", {
          credentials: 'include'
        });

        if (!res.ok) {
          if (res.status === 401) {
            return null;
          }
          throw new Error("Failed to fetch user");
        }

        return res.json();
      } catch (error) {
        console.error("Error fetching user:", error);
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1, // Only retry once
    retryDelay: 1000, // Wait 1 second before retrying
  });

  useEffect(() => {
    if (error) {
      console.error("Auth provider error:", error);
    }
  }, [error]);

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const logoutMutation = useLogoutMutation();
  const guestLoginMutation = useGuestLoginMutation();
  
  // Check if the current user is a guest
  const isGuest = user?.is_guest ?? false;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error: error as Error | null,
        loginMutation,
        registerMutation,
        logoutMutation,
        guestLoginMutation,
        isGuest
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}