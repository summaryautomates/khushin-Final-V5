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
      <section className="min-h-[80vh] flex items-center justify-center bg-gradient-to-r from-zinc-50 to-zinc-100">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-light tracking-tight text-zinc-900 mb-8">
              Make your loved ones happy!
            </h1>
            <p className="mt-6 text-lg md:text-xl leading-relaxed text-zinc-600 max-w-2xl mx-auto">
              Discover our curated collection of exquisitely crafted pieces, 
              where luxury meets timeless elegance in every detail.
            </p>
            <div className="mt-12 flex items-center justify-center gap-x-8">
              <Link href="/products">
                <Button size="lg" className="text-base px-8 py-6">
                  Explore Collection
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="text-base px-8 py-6">
                  Book Consultation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-white">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-light text-center mb-16">
            Featured Pieces
          </h2>
          {isLoading ? (
            <div className="text-center text-zinc-500">Loading collection...</div>
          ) : (
            products && <ProductGrid products={products.slice(0, 4)} />
          )}
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-24 bg-zinc-50">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-light mb-8">Our Heritage</h2>
            <p className="text-lg text-zinc-600 leading-relaxed">
              Since our inception, KHUSH.IN has been dedicated to crafting exceptional 
              pieces that embody sophistication and refinement. Each creation is a 
              testament to our commitment to excellence and timeless luxury.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}