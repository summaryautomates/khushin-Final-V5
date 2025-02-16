import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { Home } from "@/pages/home";
import { Products } from "@/pages/products";
import { Product } from "@/pages/product";
import { Customize } from "@/pages/customize";
import { Contact } from "@/pages/contact";
import { Blog } from "@/pages/blog";
import { NotFound } from "@/pages/not-found";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FAQs } from "@/pages/support/faqs";
import { Returns } from "@/pages/support/returns";
import { Shipping } from "@/pages/support/shipping";
import { Warranty } from "@/pages/support/warranty";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/products" component={Products} />
            <Route path="/product/:id" component={Product} />
            <Route path="/customize" component={Customize} />
            <Route path="/contact" component={Contact} />
            <Route path="/blog" component={Blog} />
            <Route path="/support/faqs" component={FAQs} />
            <Route path="/support/returns" component={Returns} />
            <Route path="/support/shipping" component={Shipping} />
            <Route path="/support/warranty" component={Warranty} />
            <Route component={NotFound} />
          </Switch>
        </main>
        <Footer />
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}