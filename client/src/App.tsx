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

// WebSocket connection helper with improved reliability
const createWebSocketConnection = (wsUrl: string) => {
  let ws: WebSocket | null = null;
  let reconnectTimeout: NodeJS.Timeout | null = null;
  let isIntentionallyClosed = false;
  let reconnectAttempts = 0;
  const MAX_RECONNECT_ATTEMPTS = 10; // Increased from 5
  const INITIAL_RECONNECT_DELAY = 1000;
  const MAX_RECONNECT_DELAY = 30000; // Added max delay cap

  const connect = () => {
    if (isIntentionallyClosed || reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.log('WebSocket connection permanently closed or max attempts reached');
      return;
    }

    try {
      ws = new WebSocket(wsUrl);

      ws.addEventListener('open', () => {
        console.log('WebSocket connected successfully');
        reconnectAttempts = 0; // Reset attempts on successful connection
      });

      ws.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'welcome') {
            console.log('Server welcome message:', data.message);
          }
          // Handle other message types here
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      });

      ws.addEventListener('close', (event) => {
        if (isIntentionallyClosed) return;

        console.log(`WebSocket closed with code: ${event.code}, reason: ${event.reason}`);

        // Only attempt reconnect for specific close codes
        if (event.code === 1006 || event.code === 1001 || event.code === 1012) {
          reconnectWithBackoff();
        }
      });

      ws.addEventListener('error', (error) => {
        console.error('WebSocket error:', error);
        if (!isIntentionallyClosed && ws) {
          ws.close(); // Properly close the connection on error
        }
      });

    } catch (error) {
      console.error('Error creating WebSocket:', error);
      if (!isIntentionallyClosed) {
        reconnectWithBackoff();
      }
    }
  };

  const reconnectWithBackoff = () => {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
    }

    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      const delay = Math.min(
        INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttempts),
        MAX_RECONNECT_DELAY
      );
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})`);

      reconnectTimeout = setTimeout(() => {
        reconnectAttempts++;
        connect();
      }, delay);
    } else {
      console.log('Max reconnection attempts reached. Please refresh the page to try again.');
      // Notify user about connection issues
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('websocket-max-attempts', {
          detail: { message: 'Connection lost. Please refresh the page.' }
        }));
      }
    }
  };

  return {
    connect,
    disconnect: () => {
      isIntentionallyClosed = true;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (ws) {
        ws.close(1000, 'User initiated disconnect');
      }
    }
  };
};

function App() {
  const { toast } = useToast();

  useEffect(() => {
    // WebSocket connection
    if (import.meta.env.DEV) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      const wsConnection = createWebSocketConnection(wsUrl);
      wsConnection.connect();

      // Listen for max attempts event
      const handleMaxAttempts = (event: CustomEvent) => {
        toast({
          title: "Connection Error",
          description: event.detail.message,
          variant: "destructive",
        });
      };

      window.addEventListener('websocket-max-attempts', handleMaxAttempts as EventListener);

      return () => {
        wsConnection.disconnect();
        window.removeEventListener('websocket-max-attempts', handleMaxAttempts as EventListener);
      };
    }
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