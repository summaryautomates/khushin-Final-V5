import { useQuery } from "@tanstack/react-query";
import { type Product } from "@shared/schema";
import { ProductCard } from "./product-card";
import { ProductSkeleton } from "./product-skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface SimilarProductsProps {
  currentProductId: number;
  category: string;
  collection?: string;
}

export function SimilarProducts({ currentProductId, category, collection }: SimilarProductsProps) {
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-light tracking-wide">Similar Products</h2>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex w-full space-x-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="w-[300px] flex-none">
                <ProductSkeleton />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    );
  }

  if (error || !products) {
    return null;
  }

  // Filter similar products by matching collection first, then by category if needed
  let similarProducts = products.filter(product => product.id !== currentProductId);
  
  // If we have a collection, prioritize products from the same collection
  if (collection) {
    const sameCollectionProducts = similarProducts.filter(p => p.collection === collection);
    
    // If we have enough products from the same collection, use only those
    if (sameCollectionProducts.length >= 2) {
      similarProducts = sameCollectionProducts;
    }
    // Otherwise, fall back to category
    else if (category) {
      similarProducts = similarProducts.filter(p => p.category === category);
    }
  } 
  // If no collection specified, fall back to same category
  else if (category) {
    similarProducts = similarProducts.filter(p => p.category === category);
  }
  
  // Limit to 4 products
  similarProducts = similarProducts.slice(0, 4);

  if (similarProducts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-light tracking-wide">Similar Products</h2>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-full space-x-4">
          {similarProducts.map((product) => (
            <div key={product.id} className="w-[300px] flex-none">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}