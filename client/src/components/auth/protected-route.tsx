import { useEffect, useState } from "react";
import { Route, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { AuthSheet } from "./auth-sheet";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showAuthSheet, setShowAuthSheet] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      // Show authentication required message
      toast({
        title: "Authentication required",
        description: "Please log in to continue",
        variant: "destructive",
      });
      
      // Instead of redirecting to a non-existent /auth route,
      // open the AuthSheet directly from here
      setShowAuthSheet(true);
    }
  }, [user, isLoading, toast]);

  // Handle successful auth completion by closing the sheet
  const handleAuthSuccess = () => {
    setShowAuthSheet(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // Show auth sheet when no user, but stay on the current route
    return (
      <>
        <AuthSheet 
          open={showAuthSheet} 
          onOpenChange={setShowAuthSheet} 
          onSuccess={handleAuthSuccess} 
          showTrigger={false} 
        />
        <div className="container py-8 min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-semibold">Authentication Required</h1>
            <p className="text-muted-foreground">Please log in or create an account to continue</p>
            <button 
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
              onClick={() => setShowAuthSheet(true)}
            >
              Login / Register
            </button>
          </div>
        </div>
      </>
    );
  }

  return <Route path={path}><Component /></Route>;
}