import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/hooks/use-cart";
import { ErrorBoundary } from "@/components/error-boundary";
import { AuthProvider } from "@/hooks/use-auth.tsx";
import { Switch, Route, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { AIAssistant } from "@/components/ai-assistant/AIAssistant";
import { useWebSocket } from "@/lib/websocket";
import { FlameCursor } from "@/components/ui/flame-cursor";

// Page imports
import Home from "@/pages/home";
import Products from "@/pages/products";
import Product from "@/pages/product";
import Cart from "@/pages/cart";
import Contact from "@/pages/contact";
import NotFound from "@/pages/not-found";
import Compare from "@/pages/compare";
import Returns from "@/pages/support/returns";
import Warranty from "@/pages/support/warranty";
import Shipping from "@/pages/support/shipping";
import FAQs from "@/pages/support/faqs";
import Customize from "@/pages/customize";
import CheckoutSuccess from "@/pages/checkout-success";
import CheckoutPayment from "@/pages/checkout-payment";
import Orders from "@/pages/orders";
import OrderDetails from "@/pages/order-details";
import Refueling from "@/pages/refueling";
import EventOrganizer from "@/pages/event-organizer";
import ExpressDelivery from "@/pages/express-delivery";
import Loyalty from "@/pages/loyalty";
import Rewards from "@/pages/rewards";
import Referral from "@/pages/referral";
import { ProtectedRoute } from "@/components/auth/protected-route";
import PremiumCollection from "@/pages/premium-collection";
import LuxuryLighters from "@/pages/luxury-lighters";


function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();

  useEffect(() => {
    // Maintain a log of recent errors to prevent duplicate toasts
    const recentErrors = new Set<string>();
    const ERROR_THROTTLE_MS = 5000; // Only show same error once every 5 seconds

    // Handle uncaught errors
    const handleError = (event: ErrorEvent) => {
      event.preventDefault();

      console.error('Uncaught error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        stack: event.error?.stack,
        timestamp: new Date().toISOString()
      });

      const errorKey = `${event.message}-${event.filename}-${event.lineno}`;
      if (!recentErrors.has(errorKey)) {
        recentErrors.add(errorKey);
        setTimeout(() => recentErrors.delete(errorKey), ERROR_THROTTLE_MS);

        toast({
          title: "Error",
          description: event.message || "An unexpected error occurred. Please try again.",
          variant: "destructive"
        });
      }
    };

    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();

      // Skip Vite HMR-related errors completely 
      // These happen in development mode and aren't actual application errors
      const isViteError = 
        event.reason?.stack?.includes('@vite/client') || 
        (typeof event.reason === 'object' && Object.keys(event.reason).length === 0) || 
        event.reason?.message?.includes('Failed to fetch') ||
        event.reason?.message?.includes('Network Error') ||
        event.reason?.message?.includes('WebSocket') ||
        (window as any).__suppressViteHMRErrors === true && (
          event.reason?.message?.includes('Vite') ||
          event.reason?.message?.includes('hmr') || 
          event.reason?.message?.includes('HMR') ||
          event.reason?.stack?.includes('vite') ||
          event.reason?.message?.includes('sockjs')
        );
      
      if (isViteError) {
        // Just silently log these without additional handling
        if (process.env.NODE_ENV !== 'production') {
          console.debug('Suppressed Vite client error (development only):', {
            type: 'unhandledRejection',
            source: 'vite-hmr',
            timestamp: new Date().toISOString()
          });
        }
        return;
      }

      console.error('Unhandled rejection:', {
        reason: event.reason,
        stack: event.reason?.stack,
        timestamp: new Date().toISOString()
      });

      // Skip any connection errors as they should be handled by their respective hooks
      if (event.reason?.message?.includes('connection') || 
          event.reason?.message?.includes('Connection')) {
        return;
      }

      const rejectionKey = event.reason?.message || 'unknown-rejection';
      if (!recentErrors.has(rejectionKey)) {
        recentErrors.add(rejectionKey);
        setTimeout(() => recentErrors.delete(rejectionKey), ERROR_THROTTLE_MS);

        toast({
          title: "Application Error",
          description: event.reason?.message || "An unexpected error occurred. Please try again.",
          variant: "destructive"
        });
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, [toast]);

  // Initialize WebSocket connection
  const { isConnected } = useWebSocket();

  // Show connection status to user
  useEffect(() => {
    if (!isConnected) {
      toast({
        title: "Connection Status",
        description: "Connecting to server...",
        duration: 2000,
      });
    }
  }, [isConnected, toast]);

  return <>{children}</>;
}

function AppRoutes() {
  const [location] = useLocation();

  // Scroll to top whenever the location changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <main className="flex-1">
      {/* Responsive Container - Mobile First Approach */}
      <div className="w-full">
        <div className="px-4 py-3 sm:px-6 md:container md:mx-auto md:py-8 md:max-w-7xl">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/products" component={Products} />
            <Route path="/products/category/:category" component={Products} />
            <Route path="/product/:id" component={Product} />
            <Route path="/compare" component={Compare} />
            <ProtectedRoute path="/cart" component={Cart} />
            <ProtectedRoute path="/checkout/payment" component={CheckoutPayment} />
            <ProtectedRoute path="/checkout/success" component={CheckoutSuccess} />
            <Route path="/contact" component={Contact} />
            <Route path="/customize" component={Customize} />
            <Route path="/refueling" component={Refueling} />
            <ProtectedRoute path="/orders" component={Orders} />
            <ProtectedRoute path="/orders/:orderRef" component={OrderDetails} />
            <Route path="/faqs" component={FAQs} />
            <Route path="/warranty" component={Warranty} />
            <Route path="/shipping" component={Shipping} />
            <Route path="/returns" component={Returns} />
            <Route path="/event-organizer" component={EventOrganizer} />
            <Route path="/express-delivery" component={ExpressDelivery} />
            <Route path="/loyalty" component={Loyalty} />
            <Route path="/rewards" component={Rewards} />
            <Route path="/referral" component={Referral} />
            <Route path="/premium-collection" component={PremiumCollection} />
            <Route path="/luxury-lighters" component={LuxuryLighters} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
    </main>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthProvider>
          <ErrorBoundary>
            <WebSocketProvider>
              <CartProvider>
                <div className="min-h-screen flex flex-col bg-background">
                  <Header />
                  <AppRoutes />
                  <Footer />
                  <AIAssistant />
                  <FlameCursor />
                </div>
                <Toaster />
              </CartProvider>
            </WebSocketProvider>
          </ErrorBoundary>
        </AuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;