import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/products";
import { Truck, Shield, RefreshCcw, Loader2 } from "lucide-react";
import type { Product } from "@shared/schema";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { ShareButtons } from "@/components/products/share-buttons";
import { ModelViewer } from "@/components/model-viewer/model-viewer";
import { SimilarProducts } from "@/components/products/similar-products";
import { AuthSheet } from "@/components/auth/auth-sheet";
import { useState, useEffect, useMemo } from "react";

const FALLBACK_IMAGES = [
  "/placeholder-product.svg",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500",
];

export default function ProductPage() {
  const [, params] = useRoute("/product/:id");
  const id = params?.id;
  const { addItem } = useCart();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [isAuthSheetOpen, setIsAuthSheetOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"add-to-cart" | "buy-now" | null>(null);
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<number, boolean>>({});
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [fallbackImageIndex, setFallbackImageIndex] = useState(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [, setLocation] = useLocation();

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: [`/api/products/${id}`],
    retry: 3,
    staleTime: 300000, // Cache for 5 minutes
    cacheTime: 3600000, // Keep in cache for 1 hour
  });

  // Preload images when product data is available
  useEffect(() => {
    if (product?.images) {
      const images = Array.isArray(product.images) ? product.images : [];
      images.forEach((imageUrl, index) => {
        if (typeof imageUrl === 'string' && !imageErrors[index]) {
          const img = new Image();
          img.src = imageUrl;
        }
      });
    }
  }, [product, imageErrors]);

  const getValidProductImage = useMemo(() => (index: number) => {
    if (!product?.images) return FALLBACK_IMAGES[0];

    const images = Array.isArray(product.images) ? product.images : [];
    if (images.length > index && !imageErrors[index]) {
      const image = images[index];
      if (image && typeof image === 'string') {
        return image;
      }
    }
    return FALLBACK_IMAGES[fallbackImageIndex];
  }, [product, imageErrors, fallbackImageIndex]);

  useEffect(() => {
    if (product?.images) {
      const images = Array.isArray(product.images) ? product.images : [];
      const initialLoadingStates = images.reduce((acc, _, index) => {
        acc[index] = true;
        return acc;
      }, {} as Record<number, boolean>);
      setImageLoadingStates(initialLoadingStates);
      setImageErrors({});
      setSelectedImage(0);
      setFallbackImageIndex(0);
    }
  }, [product]);

  const handleImageError = (index: number) => {
    console.log(`Image error at index ${index}:`, getValidProductImage(index));
    setImageErrors(prev => ({ ...prev, [index]: true }));
    setImageLoadingStates(prev => ({ ...prev, [index]: false }));

    // Try next fallback image
    setFallbackImageIndex(prev => {
      if (prev < FALLBACK_IMAGES.length - 1) {
        return prev + 1;
      }
      return prev;
    });
  };

  const handleImageLoad = (index: number) => {
    console.log(`Image loaded successfully at index ${index}:`, getValidProductImage(index));
    setImageLoadingStates(prev => ({ ...prev, [index]: false }));
    setImageErrors(prev => ({ ...prev, [index]: false }));
  };

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      await addItem(product);
      toast({
        description: `${product.name} added to cart`,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "AUTH_REQUIRED") {
        setPendingAction("add-to-cart");
        setIsAuthSheetOpen(true);
        return;
      }
      toast({
        variant: "destructive",
        description: "Failed to add item to cart",
      });
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    try {
      setIsCheckingOut(true);
      // First add to cart
      await addItem(product);

      // Redirect directly to checkout page with buy now flag
      setLocation(`/checkout-payment?buyNow=true`);
    } catch (error) {
      if (error instanceof Error && error.message === "AUTH_REQUIRED") {
        setPendingAction("buy-now");
        setIsAuthSheetOpen(true);
        return;
      }
      console.error('Buy now error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not process your request. Please try again.",
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleAuthSuccess = async () => {
    setIsAuthSheetOpen(false);
    if (pendingAction === "add-to-cart") {
      await handleAddToCart();
    } else if (pendingAction === "buy-now") {
      await handleBuyNow();
    }
    setPendingAction(null);
  };

  if (isLoading) {
    return (
      <div className="container flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
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

  const images = Array.isArray(product.images) ? product.images : [];

  return (
    <>
      <div className="container py-12">
        <div className="grid gap-12 md:grid-cols-2">
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg border bg-zinc-100 relative">
              {imageLoadingStates[selectedImage] && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              )}
              {product.category === "lighters" ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ModelViewer modelUrl="/attached_assets/zippo_lighter.glb" />
                </div>
              ) : (
                <img
                  src={getValidProductImage(selectedImage)}
                  alt={product.name}
                  className="h-full w-full object-contain p-4"
                  onError={() => handleImageError(selectedImage)}
                  onLoad={() => handleImageLoad(selectedImage)}
                  style={{
                    opacity: imageLoadingStates[selectedImage] ? 0 : 1,
                    transition: 'opacity 0.3s ease-in-out'
                  }}
                />
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4 mt-4">
                {images.map((_, i) => (
                  <div
                    key={i}
                    className={`aspect-square overflow-hidden rounded-lg border bg-zinc-100 cursor-pointer transition-all relative
                      ${selectedImage === i ? 'ring-2 ring-primary' : ''}
                      ${imageErrors[i] ? 'opacity-50' : ''}`}
                    onClick={() => !imageErrors[i] && setSelectedImage(i)}
                  >
                    {imageLoadingStates[i] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    )}
                    {product.category !== "lighters" && (
                      <img
                        src={getValidProductImage(i)}
                        alt={`${product.name} view ${i + 1}`}
                        className="h-full w-full object-contain p-2"
                        onError={() => handleImageError(i)}
                        onLoad={() => handleImageLoad(i)}
                        style={{
                          opacity: imageLoadingStates[i] ? 0 : 1,
                          transition: 'opacity 0.3s ease-in-out'
                        }}
                      />
                    )}
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
                image={getValidProductImage(0)}
              />
            </div>

            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold">Description</h3>
              <p>{product.description}</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button size="lg" variant="outline" className="w-full" onClick={handleAddToCart} disabled={isCheckingOut}>
                  Add to Cart
                </Button>
                <Button size="lg" className="w-full" onClick={handleBuyNow} disabled={isCheckingOut}>
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Buy Now"
                  )}
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
      <AuthSheet
        open={isAuthSheetOpen}
        onOpenChange={setIsAuthSheetOpen}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}