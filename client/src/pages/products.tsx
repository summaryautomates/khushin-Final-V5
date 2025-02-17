import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ProductGrid } from "@/components/products/product-grid";
import type { Product } from "@shared/schema";

export default function Products() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  if (isLoading) {
    return (
      <div className="container min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <h1 className="text-4xl font-extralight tracking-wider">Our Collection</h1>
        {products && products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No products available.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}