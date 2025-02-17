
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/products";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

export default function ProductPage() {
  const [, params] = useRoute("/product/:id");
  const { addItem } = useCart();
  const { toast } = useToast();
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: [`/api/products/${params?.id}`],
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
      const response = await fetch('/api/direct-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{
            productId: product.id,
            quantity: 1
          }]
        })
      });
      const { redirectUrl } = await response.json();
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    } catch (error) {
      console.error('Checkout error:', error);
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
          <div className="aspect-square overflow-hidden rounded-lg border bg-zinc-100">
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-contain p-4"
            />
          </div>
          {product.images.slice(1).length > 0 && (
            <div className="grid grid-cols-4 gap-4">
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

          {product.variants && product.variants.length > 0 && (
            <div className="space-y-4">
              {product.variants.some(v => v.color) && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Color</h3>
                  <div className="flex gap-2">
                    {product.variants
                      .filter((v, i, arr) => arr.findIndex(x => x.color === v.color) === i)
                      .map((variant) => (
                        <button
                          key={variant.id}
                          className={`w-8 h-8 rounded-full border-2 ${
                            selectedVariant?.color === variant.color
                              ? "border-primary"
                              : "border-transparent"
                          }`}
                          style={{ backgroundColor: variant.color }}
                          onClick={() => setSelectedVariant(variant)}
                        />
                      ))}
                  </div>
                </div>
              )}

              {product.variants.some(v => v.size) && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Size</h3>
                  <div className="flex gap-2">
                    {product.variants
                      .filter((v, i, arr) => arr.findIndex(x => x.size === v.size) === i)
                      .map((variant) => (
                        <button
                          key={variant.id}
                          className={`px-3 py-1 border rounded ${
                            selectedVariant?.size === variant.size
                              ? "border-primary bg-primary/10"
                              : "border-gray-200"
                          }`}
                          onClick={() => setSelectedVariant(variant)}
                        >
                          {variant.size}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Button size="lg" variant="outline" className="w-full" onClick={handleAddToCart}>
              Add to Cart
            </Button>
            <Button size="lg" className="w-full" onClick={handleBuyNow}>
              Buy Now
            </Button>
          </div>

          {product.features && product.features.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-semibold mb-6">Features</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {product.features.map((feature, index) => (
                  <Card key={index} className="bg-white/[0.02] backdrop-blur-sm border-none">
                    <CardHeader>
                      {feature.icon && <span className="text-primary text-2xl">{feature.icon}</span>}
                      <CardTitle className="text-lg font-medium">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {product.reviews && product.reviews.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Customer Reviews</h2>
                {product.averageRating && (
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-lg ${
                            star <= product.averageRating!
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({product.reviews.length} reviews)
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {product.reviews.map((review) => (
                  <Card key={review.id} className="bg-white/[0.02] backdrop-blur-sm border-none">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base font-medium">
                            {review.userName}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {new Date(review.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`text-sm ${
                                star <= review.rating ? "text-yellow-400" : "text-gray-300"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
