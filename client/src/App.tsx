import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/hooks/use-cart";
import { ErrorBoundary } from "@/components/error-boundary";
import { AuthProvider } from "@/hooks/use-auth";
import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { useWebSocket } from "@/lib/websocket";
import { useToast } from "@/hooks/use-toast";
import { AIAssistant } from "@/components/ai-assistant/AIAssistant";

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

function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();

  useEffect(() => {
    // Maintain a log of recent errors to prevent duplicate toasts
    const recentErrors = new Set<string>();
    const ERROR_THROTTLE_MS = 5000; // Only show same error once every 5 seconds
    
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault(); // Prevent the default handling
      
      const errorMessage = event.reason?.message || 'Unknown error';
      const errorKey = `${errorMessage}-${Date.now().toString().slice(0, -3)}`;
      
      console.error('Unhandled promise rejection:', {
        reason: event.reason,
        stack: event.reason?.stack,
        message: errorMessage,
        timestamp: new Date().toISOString()
      });

      // Only show toast if we haven't shown this error recently
      if (!recentErrors.has(errorKey)) {
        recentErrors.add(errorKey);
        
        // Remove from recent errors after throttle period
        setTimeout(() => {
          recentErrors.delete(errorKey);
        }, ERROR_THROTTLE_MS);
        
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    };

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
      
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, [toast]);

  useWebSocket(); // Initialize WebSocket connection
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
      {/* Mobile View Container */}
      <div className="md:hidden w-full">
        <div className="px-4 py-3">
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