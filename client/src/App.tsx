import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

// Page imports
import Home from "@/pages/home";
import Products from "@/pages/products";
import Product from "@/pages/product";
import Blog from "@/pages/blog";
import Contact from "@/pages/contact";
import NotFound from "@/pages/not-found";

// Create placeholder components for support pages until they're implemented
const FAQs = () => (
  <div className="container py-20 min-h-screen">
    <h1 className="text-3xl font-bold mb-8">Frequently Asked Questions</h1>
    <p>Coming soon...</p>
  </div>
);

const Warranty = () => (
  <div className="container py-20 min-h-screen">
    <h1 className="text-3xl font-bold mb-8">Warranty Information</h1>
    <p>Coming soon...</p>
  </div>
);

const Shipping = () => (
  <div className="container py-20 min-h-screen">
    <h1 className="text-3xl font-bold mb-8">Shipping Information</h1>
    <p>Coming soon...</p>
  </div>
);

const Returns = () => (
  <div className="container py-20 min-h-screen">
    <h1 className="text-3xl font-bold mb-8">Returns Policy</h1>
    <p>Coming soon...</p>
  </div>
);

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/product/:id" component={Product} />
      <Route path="/blog" component={Blog} />
      <Route path="/contact" component={Contact} />
      <Route path="/faqs" component={FAQs} />
      <Route path="/warranty" component={Warranty} />
      <Route path="/shipping" component={Shipping} />
      <Route path="/returns" component={Returns} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Router />
        </main>
        <Footer />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;