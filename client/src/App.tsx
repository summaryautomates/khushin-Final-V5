import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/hooks/use-cart";
import { ErrorBoundary } from "@/components/error-boundary";
import { TestError } from "@/components/test-error";

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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <ErrorBoundary>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/products" component={Products} />
                <Route path="/product/:id" component={Product} />
                <Route path="/cart" component={Cart} />
                <Route path="/checkout/payment" component={CheckoutPayment} />
                <Route path="/checkout/success" component={CheckoutSuccess} />
                <Route path="/contact" component={Contact} />
                <Route path="/customize" component={Customize} />
                <Route path="/faqs" component={FAQs} />
                <Route path="/warranty" component={Warranty} />
                <Route path="/shipping" component={Shipping} />
                <Route path="/returns" component={Returns} />
                <Route path="/orders" component={Orders} />
                <Route path="/test-error" component={TestError} />
                <Route component={NotFound} />
              </Switch>
            </main>
            <Footer />
          </div>
          <Toaster />
        </ErrorBoundary>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;