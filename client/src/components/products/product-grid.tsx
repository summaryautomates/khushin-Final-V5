import { ProductCard } from "./product-card";
import { ProductSkeleton } from "./product-skeleton";
import type { Product } from "@shared/schema";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
}

export function ProductGrid({ products, isLoading }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 px-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex justify-center">
            <ProductSkeleton />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 px-4">
      {products.map((product) => (
        <div key={product.id} className="flex justify-center">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}