
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/products";
import { Truck, Shield, RefreshCcw } from "lucide-react";
import type { Product } from "@shared/schema";

export default function ProductPage() {
  const [, params] = useRoute("/product/:id");
  const id = params?.id;

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: [`/api/products/${id}`],
  });

  if (isLoading) {
    return (
      <div className="container flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading product details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container flex min-h-screen items-center justify-center">
        <div className="text-lg">Product not found</div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="grid gap-12 md:grid-cols-2">
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg border">
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          {product.images.slice(1).length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.slice(1).map((image, i) => (
                <div key={i} className="aspect-square overflow-hidden rounded-lg border">
                  <img
                    src={image}
                    alt={`${product.name} view ${i + 2}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold">{product.name}</h1>
            <p className="mt-4 text-3xl font-semibold text-primary">
              {formatPrice(product.price)}
            </p>
          </div>

          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold">Description</h3>
            <p>{product.description}</p>
          </div>

          <div className="space-y-4">
            <Button size="lg" className="w-full">
              Add to Cart
            </Button>
          </div>

          <div className="space-y-6 rounded-lg border p-6">
            <div className="flex items-center space-x-4">
              <Truck className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-semibold">Free Shipping</h4>
                <p className="text-sm text-muted-foreground">On orders over $100</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-semibold">Secure Shopping</h4>
                <p className="text-sm text-muted-foreground">Protected by SSL</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <RefreshCcw className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-semibold">Easy Returns</h4>
                <p className="text-sm text-muted-foreground">30-day return policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
