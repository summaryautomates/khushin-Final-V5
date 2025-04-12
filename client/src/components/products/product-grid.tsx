import { ProductCard } from "./product-card";
import { ProductSkeleton } from "./product-skeleton";
import type { Product } from "@shared/schema";
import { motion } from "framer-motion";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
}

export function ProductGrid({ products, isLoading }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-8 md:gap-10 lg:gap-12 px-4 md:px-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <motion.div 
            key={index} 
            className="flex justify-center" 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <ProductSkeleton />
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-8 md:gap-10 lg:gap-12 px-4 md:px-6">
      {products.map((product, index) => (
        <motion.div 
          key={product.id} 
          className="flex justify-center w-full" 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </div>
  );
}