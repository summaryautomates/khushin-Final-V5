import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/hooks/use-cart";
import { ErrorBoundary } from "@/components/error-boundary";
import { AuthProvider } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

// Page imports
import Home from "@/pages/home";
import Products from "@/pages/products";
import Product from "@/pages/product";
import Cart from "@/pages/cart";
import Contact from "@/pages/contact";
import NotFound from "@/pages/not-found";
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
import { ProtectedRoute } from "@/components/auth/protected-route";

// Update the WebSocket connection helper function
const createWebSocketConnection = (wsUrl: string, maxRetries: number = 10) => {
  let ws: WebSocket | null = null;
  let reconnectAttempts = 0;
  let reconnectTimeout: NodeJS.Timeout | null = null;
  let isIntentionallyClosed = false;

  const connect = () => {
    if (isIntentionallyClosed) return;
    
    // Clear any existing connection
    if (ws) {
      ws.close();
      ws = null;
    }

    try {
      ws = new WebSocket(wsUrl);

      ws.addEventListener('open', () => {
        console.log('WebSocket connected successfully');
        reconnectAttempts = 0; // Reset attempts on successful connection
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
          reconnectTimeout = null;
        }
      });

      ws.addEventListener('error', (event) => {
        if (isIntentionallyClosed) return;
        console.warn('WebSocket error:', event);
        reconnectWithBackoff();
      });

      ws.addEventListener('close', () => {
        if (isIntentionallyClosed) return;
        console.log('WebSocket closed');
        reconnectWithBackoff();
      });
    } catch (error) {
      if (isIntentionallyClosed) return;
      console.error('WebSocket connection error:', error);
      reconnectWithBackoff();
    }
  };

  const reconnectWithBackoff = () => {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
    }
    
    // Exponential backoff with max delay of 10 seconds
    const delay = Math.min(1000 * Math.pow(1.5, reconnectAttempts), 10000);
    reconnectTimeout = setTimeout(connect, delay);
    reconnectAttempts++;
  };

  return {
    connect,
    disconnect: () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
      if (ws) {
        ws.close();
        ws = null;
      }
    }
  };
};

function App() {
  const { toast } = useToast();

  useEffect(() => {
    // Handle WebSocket connection for HMR
    if (import.meta.env.DEV) {
      // Determine protocol based on current page protocol
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.hostname}:${window.location.port}/ws`;

      const wsConnection = createWebSocketConnection(wsUrl);
      wsConnection.connect();

      return () => {
        wsConnection.disconnect();
      };
    }
  }, []);

  useEffect(() => {
    // Handle critical errors with improved error boundaries
    const handler = (event: PromiseRejectionEvent | ErrorEvent) => {
      event.preventDefault();

      // Handle network errors
      if (event instanceof ErrorEvent && event.error?.name === 'NetworkError') {
        console.warn('Network error detected, attempting recovery...');
        return;
      }

      // Extract error details
      const error = event instanceof PromiseRejectionEvent ? event.reason : event.error;
      console.error('Critical error:', error);

      if (error?.response?.status === 401) {
        // Clear auth state and redirect to login
        queryClient.setQueryData(["/api/user"], null);
        toast({
          title: "Session Expired",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
      } else if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
        toast({
          title: "Connection Error",
          description: "Please check your internet connection.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    };

    window.addEventListener('unhandledrejection', handler);
    window.addEventListener('error', handler);

    return () => {
      window.removeEventListener('unhandledrejection', handler);
      window.removeEventListener('error', handler);
    };
  }, [toast]);

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col bg-background">
              <Header />
              <main className="flex-1">
                {/* Mobile View Container */}
                <div className="md:hidden w-full">
                  <div className="px-4 py-3">
                    <Switch>
                      <Route path="/" component={Home} />
                      <Route path="/products" component={Products} />
                      <Route path="/products/category/:category" component={Products} />
                      <Route path="/product/:id" component={Product} />
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
                      <Route component={NotFound} />
                    </Switch>
                  </div>
                </div>

                {/* Desktop View Container */}
                <div className="hidden md:block w-full">
                  <div className="container mx-auto px-6 py-8 max-w-7xl">
                    <Switch>
                      <Route path="/" component={Home} />
                      <Route path="/products" component={Products} />
                      <Route path="/products/category/:category" component={Products} />
                      <Route path="/product/:id" component={Product} />
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
                      <Route component={NotFound} />
                    </Switch>
                  </div>
                </div>
              </main>
              <Footer />
            </div>
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;