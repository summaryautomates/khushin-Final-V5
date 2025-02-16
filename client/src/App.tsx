import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

// Page imports
import Home from "@/pages/home";
import Products from "@/pages/products";
import Product from "@/pages/product";
import Contact from "@/pages/contact";
import NotFound from "@/pages/not-found";
import Returns from "@/pages/support/returns";
import Warranty from "@/pages/support/warranty";
import Shipping from "@/pages/support/shipping";

// Temporary placeholder for Blog
const Blog = () => (
  <div className="container py-20 min-h-screen">
    <h1 className="text-3xl font-bold mb-8">Blog</h1>
    <p>Coming soon...</p>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/products" component={Products} />
            <Route path="/product/:id" component={Product} />
            <Route path="/blog" component={Blog} />
            <Route path="/contact" component={Contact} />
            <Route path="/warranty" component={Warranty} />
            <Route path="/shipping" component={Shipping} />
            <Route path="/returns" component={Returns} />
            <Route component={NotFound} />
          </Switch>
        </main>
        <Footer />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;