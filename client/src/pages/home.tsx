import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/products/product-grid";
import type { Product } from "@shared/schema";

export default function Home() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  return (
    <div className="flex flex-col gap-16 py-8">
      {/* Hero Section */}
      <section className="bg-accent py-24 text-accent-foreground">
        <div className="container">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Stylized Everyday Utility
            </h1>
            <p className="mt-6 text-lg leading-8">
              Discover our collection of beautifully crafted everyday items that
              combine style with functionality.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Link href="/products">
                <Button size="lg">Shop Now</Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container">
        <h2 className="mb-8 text-3xl font-bold">Featured Products</h2>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          products && <ProductGrid products={products.slice(0, 4)} />
        )}
      </section>

      {/* Categories */}
      <section className="container">
        <h2 className="mb-8 text-3xl font-bold">Shop by Category</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Add category cards here */}
        </div>
      </section>
    </div>
  );
}
