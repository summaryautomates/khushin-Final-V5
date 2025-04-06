import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/products";
import {
  Truck, Shield, RefreshCcw, Loader2, Award, Crown,
  Star, ThumbsUp, Package, Medal, Heart, Calendar, Gift, 
  Check, Info, Sparkles, ArrowLeft, BarChart2, Diamond,
  ShoppingCart
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@shared/schema";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useCompare } from "@/hooks/use-compare";
import { ShareButtons } from "@/components/products/share-buttons";
import { ModelViewer } from "@/components/model-viewer/model-viewer";
import { SimilarProducts } from "@/components/products/similar-products";
import { AuthSheet } from "@/components/auth/auth-sheet";
import { useState, Suspense, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ErrorBoundary } from "@/components/error-boundary";
import { AdaptiveImage } from "@/components/ui/adaptive-image";
import { ProductImageGallery } from "@/components/products/product-image-gallery";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export default function ProductPage() {
  const [, params] = useRoute("/product/:id");
  const id = params?.id ? parseInt(params.id, 10) : undefined;
  const { addItem } = useCart();
  const { toast } = useToast();
  const { 
    addItem: addToCompare, 
    removeItem: removeFromCompare, 
    isInCompare
  } = useCompare();
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [isAuthSheetOpen, setIsAuthSheetOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"add-to-cart" | "buy-now" | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [, setLocation] = useLocation();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToCompare, setIsAddingToCompare] = useState(false);


  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/${id}`],
    enabled: !!id,
    retry: 2,
    staleTime: 300000, // 5 minutes
    gcTime: 3600000, // 1 hour
  });

  const handleAddToCart = async () => {
    if (!product) return;

    setIsAddingToCart(true);
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
    } finally {
      setIsAddingToCart(false);
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

  const handleCompareToggle = () => {
    if (!product) return;
    
    setIsAddingToCompare(true);
    try {
      if (isInCompare(product.id)) {
        removeFromCompare(product.id);
        toast({
          description: `${product.name} removed from comparison`,
        });
      } else {
        addToCompare(product);
        toast({
          description: `${product.name} added to comparison`,
          action: (
            <Link href="/compare">
              <Button variant="link" className="gap-2">
                Compare Now
              </Button>
            </Link>
          ),
        });
      }
    } catch (error) {
      console.error('Compare error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Maximum 4 products can be compared",
      });
    } finally {
      setIsAddingToCompare(false);
    }
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
  const currentImage = images[selectedImage];

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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="container py-6"
          >
            <Button 
              variant="ghost" 
              size="sm" 
              className="mb-4 flex items-center hover:bg-secondary/20"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </motion.div>
          
          <div className="container py-8">
            {/* Luxury Lighter Header - Only show on luxury collection products */}
            {product.collection === "luxury" ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-800 p-8 md:p-12"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-30"
                  style={{ backgroundImage: "url('/LL.png')" }}
                />
                <div className="relative z-10 max-w-3xl">
                  <div className="flex items-center gap-2 mb-6">
                    <Crown className="h-8 w-8 text-gold" />
                    <h1 className="text-4xl font-light tracking-wider text-white">Luxury Lighters Collection</h1>
                  </div>
                  <p className="text-zinc-300 leading-relaxed mb-8">
                    Discover our exquisite collection of premium lighters, each piece a testament to unparalleled craftsmanship
                    and timeless elegance. From limited editions to bespoke designs, find your perfect companion of sophistication.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Badge variant="outline" className="bg-gold/10 text-gold border-gold/20 px-3 py-1.5">
                      <Diamond className="w-4 h-4 mr-2" />
                      Premium Materials
                    </Badge>
                    <Badge variant="outline" className="bg-gold/10 text-gold border-gold/20 px-3 py-1.5">
                      <Award className="w-4 h-4 mr-2" />
                      Lifetime Warranty
                    </Badge>
                    <Badge variant="outline" className="bg-gold/10 text-gold border-gold/20 px-3 py-1.5">
                      <RefreshCcw className="w-4 h-4 mr-2" />
                      Refillable
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ) : null}
            
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                {/* Featured product badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="relative z-10 mb-2"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-primary/80 to-primary text-white text-sm font-medium">
                    <Sparkles className="h-3.5 w-3.5" />
                    Featured Product
                  </div>
                </motion.div>
                
                {/* Product image display */}
                {images.length > 1 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="rounded-xl border bg-black relative shadow-xl overflow-hidden"
                  >
                    <ProductImageGallery 
                      images={images} 
                      alt={product.name}
                    />
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute top-4 left-4 z-10"
                    >
                      <Badge variant="secondary" className="bg-gold text-black px-3 py-1 flex items-center gap-2 shadow-md">
                        <Crown className="h-4 w-4" />
                        {product.collection === 'luxury' ? 'Luxury Collection' : 
                         product.collection === 'lighter' ? 'Premium Lighter' :
                         product.collection === 'flask' ? 'Premium Flask' : 
                         'Standard Collection'}
                      </Badge>
                    </motion.div>
                  </motion.div>
                ) : (
                  <>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="aspect-square overflow-hidden rounded-xl border bg-black relative shadow-xl"
                    >
                      {(product.collection === "lighter" || product.collection === "luxury") ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-full">
                            <Suspense fallback={
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                <Loader2 className="h-8 w-8 animate-spin" />
                              </div>
                            }>
                              <ModelViewer
                                modelUrl="/attached_assets/zippo_lighter.glb"
                                fallbackUrl={currentImage}
                                onError={() => console.error("Failed to load 3D model")}
                              />
                            </Suspense>
                          </div>
                        </div>
                      ) : (
                        <AdaptiveImage
                          src={currentImage}
                          alt={product.name}
                          className="h-full w-full object-contain transition-all duration-500 transform hover:scale-105"
                          containerClassName="h-full w-full"
                        />
                      )}

                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="absolute top-4 left-4"
                      >
                        <Badge variant="secondary" className="bg-gold text-black px-3 py-1 flex items-center gap-2 shadow-md">
                          <Crown className="h-4 w-4" />
                          {product.collection === 'luxury' ? 'Luxury Collection' : 
                           product.collection === 'lighter' ? 'Premium Lighter' :
                           product.collection === 'flask' ? 'Premium Flask' : 
                           'Standard Collection'}
                        </Badge>
                      </motion.div>
                    </motion.div>

                    {/* We're keeping the functionality to switch images but hiding the visual thumbnails */}
                    {images.length > 1 && (
                      <div className="hidden">
                        {images.map((image, i) => (
                          <div
                            key={i}
                            onClick={() => setSelectedImage(i)}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
                
                {/* Product specifications - only shown on mobile */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-3 md:hidden mt-4 rounded-xl border border-zinc-800 p-4 bg-black/50"
                >
                  <h3 className="text-lg font-medium tracking-wide">Specifications</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Material</p>
                      <p className="font-medium">Premium Quality</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Dimensions</p>
                      <p className="font-medium">12 × 4 × 2 cm</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Weight</p>
                      <p className="font-medium">180g</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Made in</p>
                      <p className="font-medium">India</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Collection badge and product name */}
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge 
                      variant="outline" 
                      className="text-primary border-primary/30 bg-black/70 px-3 py-1"
                    >
                      {product.collection === 'luxury' ? 'Luxury Collection' : 
                       product.collection === 'lighter' ? 'Premium Lighter' :
                       product.collection === 'flask' ? 'Premium Flask' : 
                       'Standard Collection'}
                    </Badge>
                    
                    <Badge 
                      variant="outline" 
                      className="text-emerald-600 border-emerald-600/30 bg-black/70 px-3 py-1"
                    >
                      In Stock
                    </Badge>
                  </div>
                  
                  <h1 className="text-3xl sm:text-4xl font-light tracking-wide">{product.name}</h1>
                  
                  {/* Reviews section */}
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className="h-4 w-4 text-yellow-500 fill-yellow-500" 
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">4.9</span>
                    <span className="text-sm text-muted-foreground">(125 reviews)</span>
                  </div>
                  
                  {/* Price with original price crossed out for effect */}
                  <div className="flex items-center gap-3">
                    <p className="text-3xl font-medium tracking-wide text-primary">
                      {formatPrice(product.price)}
                    </p>
                    <p className="text-lg text-muted-foreground line-through">
                      {formatPrice(Math.floor(product.price * 1.2))}
                    </p>
                    <Badge variant="secondary" className="bg-emerald-600 text-white ml-2">
                      20% OFF
                    </Badge>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <h3 className="text-xl font-medium">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                  
                  {/* Key features */}
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-emerald-600" />
                      <span className="text-sm">Hand-crafted</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-emerald-600" />
                      <span className="text-sm">Durable design</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-emerald-600" />
                      <span className="text-sm">Exclusive materials</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-emerald-600" />
                      <span className="text-sm">Lifetime warranty</span>
                    </div>
                  </div>
                </div>
                
                {/* Delivery information */}
                <div className="flex items-center gap-3 border-t pt-4">
                  <Truck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Express Delivery</p>
                    <p className="text-sm text-muted-foreground">Get it by <span className="text-primary font-medium">Tomorrow</span></p>
                  </div>
                </div>

                {/* Product actions */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="lg"
                            variant="default"
                            className="w-full tracking-wider border-2 transition-all duration-300 
                                      hover:bg-primary/90 hover:shadow-lg font-semibold text-base"
                            onClick={handleAddToCart}
                            disabled={isCheckingOut || isAddingToCart}
                          >
                            {isAddingToCart ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Adding...
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="h-5 w-5 mr-2" />
                                ADD TO CART
                              </>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Add to your shopping cart</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <Button
                      size="lg"
                      className="w-full tracking-wider shadow-lg"
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
                  
                  {/* Compare button */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={isInCompare(product.id) ? "default" : "secondary"}
                          size="default"
                          className={cn(
                            "w-full tracking-wider transition-all duration-300",
                            isInCompare(product.id) ? "bg-black hover:bg-black/90" : "bg-black hover:bg-black/90"
                          )}
                          onClick={handleCompareToggle}
                          disabled={isAddingToCompare}
                        >
                          {isAddingToCompare ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : isInCompare(product.id) ? (
                            <>
                              <BarChart2 className="h-4 w-4 mr-2" />
                              Remove from Compare
                            </>
                          ) : (
                            <>
                              <BarChart2 className="h-4 w-4 mr-2" />
                              Add to Compare
                            </>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isInCompare(product.id) ? "Remove from comparison" : "Add to comparison list"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Product features */}
                <div className="border-t border-b py-4 my-3">
                  <h3 className="text-lg font-medium mb-3">Key Benefits</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <Package className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm">Luxury Packaging</h4>
                        <p className="text-xs text-muted-foreground">Premium gift box included</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm">Authenticity Guarantee</h4>
                        <p className="text-xs text-muted-foreground">100% genuine products</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm">Fast Delivery</h4>
                        <p className="text-xs text-muted-foreground">Ships within 24 hours</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <RefreshCcw className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm">Easy Returns</h4>
                        <p className="text-xs text-muted-foreground">30-day returns</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Gift options */}
                <div className="flex items-center gap-3 pb-2">
                  <Gift className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Gift Options Available</p>
                    <p className="text-sm text-muted-foreground">Personalized message & luxury gift wrapping</p>
                  </div>
                </div>

                {/* Share buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">Share this product:</p>
                    <ShareButtons
                      url={window.location.href}
                      title={product.name}
                      description={product.description}
                      image={currentImage}
                    />
                  </div>
                  
                  {/* Need help section */}
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    <a href="#" className="text-sm text-primary hover:underline">Need help?</a>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Product specifications - desktop view */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="hidden md:block mt-10 border-t pt-8"
            >
              <h2 className="text-2xl font-light tracking-wide mb-6">Product Specifications</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <h3 className="text-base font-medium flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    Material
                  </h3>
                  <p className="text-muted-foreground text-sm">Premium quality materials sourced from the finest suppliers.</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-medium flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    Dimensions
                  </h3>
                  <p className="text-muted-foreground text-sm">12 × 4 × 2 cm (L × W × H)</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-medium flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    Weight
                  </h3>
                  <p className="text-muted-foreground text-sm">180g - lightweight and easy to carry</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-medium flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    Made in
                  </h3>
                  <p className="text-muted-foreground text-sm">Proudly crafted in India by skilled artisans</p>
                </div>
              </div>
            </motion.div>

            {/* Similar products section */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-16"
            >
              <SimilarProducts
                currentProductId={product.id}
                category={product.category}
                collection={product.collection}
              />
            </motion.div>
          </div>
          
          {/* Authentication sheet */}
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