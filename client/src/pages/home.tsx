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
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-7xl md:text-8xl font-light tracking-tight mb-12">
              Make your loved ones happy!
            </h1>
            <p className="mt-8 text-xl md:text-2xl leading-relaxed text-zinc-400 max-w-2xl mx-auto">
              Discover extraordinary pieces that define elegance
            </p>
            <div className="mt-16 flex items-center justify-center gap-x-8">
              <Link href="/products">
                <Button size="lg" className="text-lg px-12 py-8 bg-white text-black hover:bg-zinc-200">
                  Explore
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-32 bg-white">
        <div className="container">
          <h2 className="text-4xl md:text-5xl font-light text-center mb-24">
            Featured Collection
          </h2>
          {isLoading ? (
            <div className="text-center text-zinc-500">Loading collection...</div>
          ) : (
            products && <ProductGrid products={products.slice(0, 4)} />
          )}
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-32 bg-black text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-light mb-12">Heritage</h2>
            <p className="text-xl text-zinc-400 leading-relaxed">
              KHUSH.IN crafts exceptional pieces that embody sophistication. 
              Each creation is a testament to our dedication to excellence.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}