import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/products";
import { Truck, Shield, RefreshCcw } from "lucide-react";
import type { Product } from "@shared/schema";
import { useCart } from "@/hooks/use-cart";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ShareButtons } from "@/components/products/share-buttons";
import { ModelViewer } from "@/components/model-viewer/model-viewer";
import { SimilarProducts } from "@/components/products/similar-products";

export default function ProductPage() {
  const [, params] = useRoute("/product/:id");
  const id = params?.id;
  const { addItem } = useCart();
  const { toast } = useToast();

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

  const handleAddToCart = () => {
    addItem(product);
    toast({
      description: `${product.name} added to cart`,
    });
  };

  const handleBuyNow = async () => {
    try {
      const response = await apiRequest("POST", "/api/direct-checkout", {
        items: [{ productId: product.id, quantity: 1 }],
      });
      const { redirectUrl } = await response.json();
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        variant: "destructive",
        title: "Checkout Failed",
        description: "Could not process checkout. Please try again.",
      });
    }
  };

  return (
    <div className="container py-12">
      <div className="grid gap-12 md:grid-cols-2">
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg border bg-zinc-100 relative">
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-contain p-4"
            />
            {product.category === "lighters" && (
              <div className="absolute inset-0 flex items-center justify-center bg-opacity-50">
                <ModelViewer modelUrl="/attached_assets/zippo_lighter.glb" />
              </div>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4 mt-4">
              {product.images.slice(1).map((image, i) => (
                <div key={i} className="aspect-square overflow-hidden rounded-lg border bg-zinc-100">
                  <img
                    src={image}
                    alt={`${product.name} view ${i + 2}`}
                    className="h-full w-full object-contain p-2"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">{product.name}</h1>
              <p className="mt-4 text-3xl font-semibold text-primary">
                {formatPrice(product.price)}
              </p>
            </div>
            <ShareButtons
              url={window.location.href}
              title={product.name}
              description={product.description}
              image={product.images[0]}
            />
          </div>

          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold">Description</h3>
            <p>{product.description}</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button size="lg" variant="outline" className="w-full" onClick={handleAddToCart}>
                Add to Cart
              </Button>
              <Button size="lg" className="w-full" onClick={handleBuyNow}>
                Buy Now
              </Button>
            </div>
          </div>

          <div className="space-y-6 rounded-lg border p-6">
            <div className="flex items-center space-x-4">
              <Truck className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-semibold">Free Shipping</h4>
                <p className="text-sm text-muted-foreground">On orders over ₹5000</p>
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

      <div className="mt-16">
        <SimilarProducts 
          currentProductId={product.id} 
          category={product.category} 
        />
      </div>
    </div>
  );
}