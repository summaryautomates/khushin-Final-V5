
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@shared/schema";

export default function PremiumCollection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPremiumProducts = async () => {
      try {
        const response = await fetch("/api/products");
        const data = await response.json();
        
        // Filter for premium products only
        const premiumProducts = data.filter((product: Product) => 
          product.tags?.includes("premium")
        );
        
        setProducts(premiumProducts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching premium products:", error);
        setLoading(false);
      }
    };

    fetchPremiumProducts();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-8">
          <Crown className="h-8 w-8 text-gold" />
          <h1 className="text-3xl md:text-4xl font-bold">Premium Collection</h1>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-muted-foreground mb-8 max-w-3xl">
            Discover our exclusive premium collection, featuring the finest craftsmanship and
            luxurious materials. Each piece is meticulously designed to provide an exceptional
            experience for those who value sophistication and elegance.
          </p>
        </motion.div>

        <div className="mt-10">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array(8)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-[300px] w-full rounded-xl" />
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-10 w-[150px]" />
                  </div>
                ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Badge className="bg-gold/10 text-gold border-gold/20 mb-4">Coming Soon</Badge>
                <p className="text-muted-foreground">
                  Our premium collection is currently being curated. Check back soon for exquisite new additions.
                </p>
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
