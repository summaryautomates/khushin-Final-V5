import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LuxuryButton } from "@/components/ui/luxury-button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/products";
import type { Product } from "@shared/schema";
import { Eye, ShoppingCart, Loader2, Scale, Crown, Star, BarChart2, Heart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useCompare } from "@/hooks/use-compare";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { AdaptiveImage } from "@/components/ui/adaptive-image";
import { ProductImageGallery } from "./product-image-gallery";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const FALLBACK_IMAGES = [
  "/product-placeholder.svg",
  "/placeholder-product-2.svg",
  "/placeholder-product-3.svg"
];

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { addItem: addToCompare, removeItem: removeFromCompare, isInCompare } = useCompare();
  const { toast } = useToast();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToCompare, setIsAddingToCompare] = useState(false);
  const [, setLocation] = useLocation();

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      await addItem(product);
      toast({
        description: `${product.name} added to cart`,
      });
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    setIsAddingToCart(true);
    try {
      await addItem(product);
      setLocation(`/cart?buyNow=true`);
    } catch (error) {
      console.error("Failed to process buy now:", error);
      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleCompareToggle = (e?: React.MouseEvent) => {
    // Prevent link navigation when clicking on the compare button within the image
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
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
      toast({
        variant: "destructive",
        title: "Could not add to comparison",
        description: error instanceof Error ? error.message : "Maximum 4 products can be compared",
      });
    } finally {
      setIsAddingToCompare(false);
    }
  };

  // Check if this product has multiple images to display a gallery
  const hasMultipleImages = product.images && product.images.length > 1;

  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      whileHover={{ 
        y: -5, 
        scale: 1.02,
        transition: { type: "spring", stiffness: 300, damping: 15 }
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full h-full perspective-1000"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="border border-zinc-800/50 overflow-hidden group rounded-xl shadow-lg transition-all duration-300 bg-gradient-to-b from-zinc-900 to-black h-full">
        <CardContent className="p-0 h-full flex flex-col">
          <Link href={`/product/${product.id}`} className="block relative overflow-hidden group">
            <div className="relative">
              {/* Premium badge for luxury products with animation */}
              <AnimatePresence>
                {product.collection === 'luxury' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="absolute top-4 right-4 z-10"
                  >
                    <Badge className="bg-gradient-to-r from-primary/90 to-primary backdrop-blur-sm text-black font-medium px-3 py-1.5 uppercase tracking-wider text-xs shadow-lg flex items-center gap-1.5 border-none">
                      <Crown className="h-3.5 w-3.5" />
                      <span className="tracking-widest">Premium</span>
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {hasMultipleImages ? (
                <ProductImageGallery 
                  images={product.images} 
                  alt={product.name}
                  showThumbnails={false}
                  className="aspect-square w-full max-h-[320px]" 
                />
              ) : (
                <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-zinc-900/60 to-black w-full max-h-[320px] transition-all duration-300">
                  {/* Clean minimalist background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/40 to-black/70" />
                  
                  {/* Product Image with refined animation */}
                  <motion.div
                    className="relative z-10 h-full w-full p-6 flex items-center justify-center"
                    initial={{ scale: 1 }}
                    animate={{ 
                      scale: isHovered ? 1.06 : 1,
                      y: isHovered ? -3 : 0
                    }}
                    transition={{ 
                      duration: 0.5, 
                      ease: "easeOut",
                      type: "spring",
                      stiffness: 120
                    }}
                  >
                    <AdaptiveImage
                      src={product.images?.[0] || ""}
                      alt={product.name}
                      className="w-full h-full object-contain object-center filter drop-shadow-md transition-all duration-500"
                      containerClassName="h-full w-full"
                    />
                  </motion.div>
                  
                  {/* Simplified hover overlay with focused content */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80 backdrop-blur-[2px] opacity-0 flex items-center justify-center z-20"
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div 
                      className="flex flex-col gap-3 px-6 w-full max-w-[85%]"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ 
                        opacity: isHovered ? 1 : 0, 
                        y: isHovered ? 0 : 10 
                      }}
                      transition={{ 
                        duration: 0.3, 
                        delay: 0.05
                      }}
                    >
                      {/* Add to Cart Button - simplified for better focus */}
                      <Button
                        size="sm"
                        variant="default"
                        className="w-full bg-primary hover:bg-primary/90 text-black dark:text-black font-bold shadow-md transition-all duration-300 py-4 rounded-lg relative overflow-hidden"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToCart();
                        }}
                        disabled={isAddingToCart}
                      >
                        {/* Subtle shine effect */}
                        <motion.div 
                          className="absolute inset-0 bg-white/20 skew-x-12 opacity-0"
                          animate={{ 
                            x: isHovered ? ["100%", "-100%"] : "0%",
                            opacity: isHovered ? [0, 0.2, 0] : 0
                          }}
                          transition={{ 
                            duration: 1.5, 
                            repeat: isHovered ? Infinity : 0,
                            repeatDelay: 0.8
                          }}
                        />
                        
                        {isAddingToCart ? (
                          <div className="flex items-center justify-center gap-2 relative z-10">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="font-bold tracking-wider">ADDING...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2 relative z-10">
                            <ShoppingCart className="h-4 w-4" strokeWidth={2.5} />
                            <span className="font-bold tracking-wider">ADD TO CART</span>
                          </div>
                        )}
                      </Button>
                    </motion.div>
                  </motion.div>
                </div>
              )}
              
              {/* Minimal action buttons */}
              <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-30 flex items-center gap-1 sm:gap-2">
                {/* Favorite button with simple heart animation */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Button
                          size="icon"
                          variant="secondary"
                          className={cn(
                            "w-8 h-8 rounded-full backdrop-blur-sm border transition-all duration-300",
                            isFavorite 
                              ? "bg-red-500/80 text-white border-red-400/20" 
                              : "bg-black/40 hover:bg-black/60 border-white/10"
                          )}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsFavorite(!isFavorite);
                          }}
                        >
                          <motion.div
                            animate={isFavorite ? 
                              { scale: [1, 1.2, 1] } : 
                              { scale: 1 }
                            }
                            transition={{ duration: 0.3 }}
                          >
                            <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
                          </motion.div>
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-black/90 text-white border-zinc-800 text-xs">
                      <p>{isFavorite ? "Remove from wishlist" : "Add to wishlist"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {/* Compare button */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Button
                          size="icon"
                          variant={isInCompare(product.id) ? "default" : "secondary"}
                          className={cn(
                            "w-8 h-8 rounded-full backdrop-blur-sm border transition-all duration-300",
                            isInCompare(product.id) 
                              ? "bg-primary/80 text-primary-foreground border-primary/20" 
                              : "bg-black/40 hover:bg-black/60 border-white/10"
                          )}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCompareToggle();
                          }}
                          disabled={isAddingToCompare}
                        >
                          {isAddingToCompare ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <BarChart2 className="h-4 w-4" />
                          )}
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-black/90 text-white border-zinc-800 text-xs">
                      <p>{isInCompare(product.id) ? "Remove from comparison" : "Add to comparison"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </Link>

          {/* Product info section with simplified minimal styling */}
          <motion.div 
            className="p-6 pt-5 space-y-3 relative bg-gradient-to-b from-zinc-900/50 to-black rounded-b-xl flex-grow flex flex-col"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {/* Clean minimal rating stars */}
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((_, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  whileHover={{ scale: 1.2 }}
                >
                  <Star className="h-3.5 w-3.5 text-primary fill-primary" />
                </motion.div>
              ))}
            </div>

            {/* Product name with minimal animations */}
            <Link href={`/product/${product.id}`} className="block group">
              <motion.h3 
                className="font-medium text-base tracking-wide text-white text-center line-clamp-2 min-h-[2.5rem] transition-colors duration-200 group-hover:text-primary/90"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                {product.name.toUpperCase()}
              </motion.h3>
            </Link>
            
            {/* Streamlined product description */}
            <p className="text-sm leading-relaxed text-zinc-300 tracking-wide text-center line-clamp-2 min-h-[2.5rem] opacity-80">
              {product.description}
            </p>
            
            {/* Clean price display */}
            <div className="flex justify-center items-center gap-3 mt-1">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative font-semibold text-xl text-primary tracking-wider">
                  {formatPrice(product.price)}
                </div>
              </motion.div>
            </div>
            
            {/* Minimal add to cart button */}
            <div className="pt-4 mt-auto">
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <Button 
                  variant="default"
                  size="default"
                  className="w-full bg-primary hover:bg-primary/90 text-black font-semibold tracking-wide border-0 shadow-md transition-all duration-200 py-4 sm:py-5 text-sm sm:text-base rounded-lg overflow-hidden relative"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                >
                  {/* Subtle shine effect */}
                  <motion.div 
                    className="absolute inset-0 bg-white/10 skew-x-12 opacity-0"
                    animate={isHovered ? {
                      x: ["100%", "-100%"],
                      opacity: [0, 0.2, 0]
                    } : {}}
                    transition={{ 
                      duration: 1.2,
                      repeat: isHovered ? Infinity : 0,
                      repeatDelay: 0.8
                    }}
                  />
                  
                  {isAddingToCart ? (
                    <div className="flex items-center justify-center gap-2 relative z-10">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="font-medium tracking-wide">ADDING...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 relative z-10">
                      <ShoppingCart className="h-4 w-4" strokeWidth={2} />
                      <span className="font-medium tracking-wide">ADD TO CART</span>
                    </div>
                  )}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}