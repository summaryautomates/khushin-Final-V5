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

function App() {
  useEffect(() => {
    // Handle unhandled promise rejections globally
    const handler = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      console.error('Unhandled rejection:', event.reason);

      // Clear query cache on unhandled rejections to prevent stale data
      queryClient.clear();
    };

    window.addEventListener('unhandledrejection', handler);

    return () => {
      window.removeEventListener('unhandledrejection', handler);
    };
  }, []);

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
            <ErrorBoundary>
              <Toaster />
            </ErrorBoundary>
          </CartProvider>
        </AuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;