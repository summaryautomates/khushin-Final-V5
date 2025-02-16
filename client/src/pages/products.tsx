import { useQuery } from "@tanstack/react-query";
import { ProductGrid } from "@/components/products/product-grid";
import type { Product } from "@shared/schema";

export default function Products() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">All Products</h1>
      {products && <ProductGrid products={products} />}
    </div>
  );
}
