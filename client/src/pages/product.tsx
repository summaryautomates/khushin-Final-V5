import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/products";
import {
  Truck, Shield, RefreshCcw, Loader2, Award, Crown,
  Star, ThumbsUp, Package, Medal
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@shared/schema";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { ShareButtons } from "@/components/products/share-buttons";
import { ModelViewer } from "@/components/model-viewer/model-viewer";
import { SimilarProducts } from "@/components/products/similar-products";
import { AuthSheet } from "@/components/auth/auth-sheet";
import { useState, useEffect, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ErrorBoundary } from "@/components/error-boundary";
import { AdaptiveImage } from "@/components/ui/adaptive-image";

const FALLBACK_IMAGES = [
  "/product-placeholder.svg",
  "/placeholder-product-2.svg",
  "/placeholder-product-3.svg"
];

export default function ProductPage() {
  const [, params] = useRoute("/product/:id");
  const id = params?.id ? parseInt(params.id, 10) : undefined;
  const { addItem } = useCart();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [isAuthSheetOpen, setIsAuthSheetOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"add-to-cart" | "buy-now" | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [, setLocation] = useLocation();

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/${id}`],
    enabled: !!id,
    retry: 3,
    staleTime: 300000,
    gcTime: 3600000,
    onError: (err) => {
      console.error('Product fetch error:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load product. Please try again.",
      });
    }
  });

  const getValidProductImage = (index: number): string => {
    if (!product?.images?.length || index < 0 || index >= product.images.length) {
      return FALLBACK_IMAGES[0];
    }
    return product.images[index] || FALLBACK_IMAGES[0];
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
      console.error('Add to cart error:', error);
      toast({
        variant: "destructive",
        description: "Failed to add item to cart. Please try again.",
      });
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    try {
      setIsCheckingOut(true);
      await addItem(product);
      setLocation(`/cart?buyNow=true`);
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

  if (!product || !id) {
    return (
      <div className="container flex min-h-screen items-center justify-center">
        <div className="text-lg">Product not found</div>
      </div>
    );
  }

  const images = Array.isArray(product.images) ? product.images : [];

  return (
    <ErrorBoundary>
      {error ? (
        <div className="container flex min-h-screen items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-medium">Failed to load product</h2>
            <p className="text-muted-foreground">Please try refreshing the page</p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="container py-12">
            <div className="grid gap-12 md:grid-cols-2">
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="aspect-square overflow-hidden rounded-xl border bg-zinc-100 relative shadow-2xl"
                >
                  {product.category === "lighters" ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-full">
                        <Suspense fallback={
                          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                            <Loader2 className="h-8 w-8 animate-spin" />
                          </div>
                        }>
                          <ModelViewer
                            modelUrl="/attached_assets/zippo_lighter.glb"
                            fallbackUrl={getValidProductImage(selectedImage)}
                            onError={() => console.error("Failed to load 3D model")}
                          />
                        </Suspense>
                      </div>
                    </div>
                  ) : (
                    <AdaptiveImage
                      src={getValidProductImage(selectedImage)}
                      alt={product.name}
                      className="h-full w-full object-contain p-4"
                      containerClassName="h-full w-full"
                    />
                  )}

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute top-4 left-4"
                  >
                    <Badge variant="secondary" className="bg-gold text-black px-3 py-1 flex items-center gap-2">
                      <Crown className="h-4 w-4" />
                      Premium Collection
                    </Badge>
                  </motion.div>
                </motion.div>

                {images.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-4 gap-4 mt-4"
                  >
                    {images.map((_, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        className={`aspect-square overflow-hidden rounded-lg border bg-zinc-100 cursor-pointer transition-all relative
                          ${selectedImage === i ? 'ring-2 ring-gold shadow-lg' : ''}`}
                        onClick={() => setSelectedImage(i)}
                      >
                        <AdaptiveImage
                          src={getValidProductImage(i)}
                          alt={`${product.name} view ${i + 1}`}
                          className="h-full w-full object-contain p-2"
                          containerClassName="h-full w-full"
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <Badge variant="outline" className="text-primary">Luxury Collection</Badge>
                  <h1 className="text-4xl font-light tracking-wider">{product.name}</h1>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm text-muted-foreground">(125 reviews)</span>
                  </div>
                  <p className="text-3xl font-light tracking-widest text-primary">
                    {formatPrice(product.price)}
                  </p>
                </div>

                <div className="prose max-w-none space-y-4">
                  <h3 className="text-xl font-light tracking-wide">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">{product.description}</p>

                  <div className="flex gap-4 py-4">
                    <div className="flex items-center gap-2">
                      <Medal className="h-5 w-5 text-primary" />
                      <span className="text-sm">Certified Authentic</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      <span className="text-sm">Premium Quality</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="h-5 w-5 text-primary" />
                      <span className="text-sm">Satisfaction Guaranteed</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full tracking-wider"
                      onClick={handleAddToCart}
                      disabled={isCheckingOut}
                    >
                      Add to Cart
                    </Button>
                    <Button
                      size="lg"
                      className="w-full tracking-wider"
                      onClick={handleBuyNow}
                      disabled={isCheckingOut}
                    >
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

                <div className="space-y-6 rounded-xl border p-6 bg-black/5 backdrop-blur-sm">
                  <div className="flex items-center space-x-4">
                    <Package className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-light tracking-wide">Luxury Packaging</h4>
                      <p className="text-sm text-muted-foreground">Premium gift box included</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Truck className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-light tracking-wide">Express Delivery</h4>
                      <p className="text-sm text-muted-foreground">Free shipping on orders over ₹5000</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Shield className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-light tracking-wide">Authenticity Guaranteed</h4>
                      <p className="text-sm text-muted-foreground">100% genuine products</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <RefreshCcw className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-light tracking-wide">Easy Returns</h4>
                      <p className="text-sm text-muted-foreground">30-day hassle-free returns</p>
                    </div>
                  </div>
                </div>

                <ShareButtons
                  url={window.location.href}
                  title={product.name}
                  description={product.description}
                  image={getValidProductImage(0)}
                />
              </motion.div>
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
      )}
    </ErrorBoundary>
  );
}