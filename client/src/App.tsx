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
import Refueling from "@/pages/refueling";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <ErrorBoundary>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              <Switch>
                <Route path="/">{Home}</Route>
                <Route path="/products">{Products}</Route>
                <Route path="/product/:id">{Product}</Route>
                <Route path="/cart">{Cart}</Route>
                <Route path="/checkout/payment">{CheckoutPayment}</Route>
                <Route path="/checkout/success">{CheckoutSuccess}</Route>
                <Route path="/contact">{Contact}</Route>
                <Route path="/customize">{Customize}</Route>
                <Route path="/faqs">{FAQs}</Route>
                <Route path="/warranty">{Warranty}</Route>
                <Route path="/shipping">{Shipping}</Route>
                <Route path="/returns">{Returns}</Route>
                <Route path="/orders">{Orders}</Route>
                <Route path="/test-error">{TestError}</Route>
                <Route path="/refueling">{Refueling}</Route>
                <Route>{NotFound}</Route>
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