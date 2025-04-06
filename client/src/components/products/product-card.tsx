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
                <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-zinc-900/80 to-black w-full max-h-[320px] group-hover:from-zinc-800/80 transition-all duration-500">
                  {/* Background pattern with subtle animation */}
                  <motion.div 
                    className="absolute inset-0 bg-[url('/images/dark-texture.svg')] opacity-20"
                    animate={{ 
                      opacity: isHovered ? 0.3 : 0.2,
                      scale: isHovered ? 1.05 : 1 
                    }}
                    transition={{ duration: 0.7 }}
                  />
                  
                  {/* Subtle glow effect on hover */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0"
                    animate={{ 
                      opacity: isHovered ? 0.6 : 0 
                    }}
                    transition={{ duration: 0.5 }}
                  />
                  
                  {/* Product Image with enhanced animation */}
                  <motion.div
                    className="relative z-10 h-full w-full p-4"
                    initial={{ scale: 1 }}
                    animate={{ 
                      scale: isHovered ? 1.08 : 1,
                      y: isHovered ? -5 : 0
                    }}
                    transition={{ 
                      duration: 0.6, 
                      ease: "easeOut",
                      type: "spring",
                      stiffness: 100
                    }}
                  >
                    <AdaptiveImage
                      src={product.images?.[0] || ""}
                      alt={product.name}
                      className="w-full h-full object-contain object-center transition-all duration-700 filter drop-shadow-lg"
                      containerClassName="h-full w-full"
                    />
                  </motion.div>
                  
                  {/* Enhanced overlay on hover with better animation */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/90 backdrop-blur-sm opacity-0 transition-all duration-500 flex items-center justify-center z-20"
                    animate={{ 
                      opacity: isHovered ? 0.85 : 0 
                    }}
                    transition={{ duration: 0.4 }}
                  >
                    <motion.div 
                      className="flex flex-col gap-4 px-4 w-full max-w-xs"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ 
                        opacity: isHovered ? 1 : 0, 
                        y: isHovered ? 0 : 15 
                      }}
                      transition={{ 
                        duration: 0.4, 
                        delay: 0.1,
                        type: "spring",
                        stiffness: 100
                      }}
                    >
                      {/* Quick View Button */}
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-full border border-white/30 text-white hover:bg-white/20 backdrop-blur-md transition-all duration-300 py-5 shadow-lg rounded-lg group overflow-hidden relative"
                      >
                        <motion.div 
                          className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          animate={{ 
                            opacity: isHovered ? 0.1 : 0 
                          }}
                        />
                        <div className="flex items-center justify-center gap-2 relative z-10">
                          <Eye className="h-4 w-4" />
                          <span className="font-medium tracking-wider">QUICK VIEW</span>
                        </div>
                      </Button>
                      
                      {/* Add to Cart Button with enhanced animation */}
                      <Button
                        size="sm"
                        variant="default"
                        className="w-full bg-primary hover:bg-primary/90 text-black dark:text-black font-bold hover:shadow-lg shadow-md shadow-primary/30 backdrop-blur-md transition-all duration-300 transform hover:scale-105 py-5 rounded-lg relative overflow-hidden"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToCart();
                        }}
                        disabled={isAddingToCart}
                      >
                        {/* Animated background effect */}
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-primary/60 via-primary to-primary/60 opacity-0"
                          animate={{ 
                            x: isHovered ? ["0%", "100%"] : "0%",
                            opacity: isHovered ? 0.6 : 0
                          }}
                          transition={{ 
                            duration: 1.5, 
                            repeat: Infinity,
                            repeatType: "reverse" 
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
              
              {/* Action buttons with enhanced animations */}
              <div className="absolute top-5 left-5 z-30 flex flex-col gap-3">
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
                            "w-10 h-10 rounded-full shadow-xl backdrop-blur-md border-2 transition-all duration-300",
                            isInCompare(product.id) 
                              ? "bg-primary/90 text-primary-foreground border-primary/50" 
                              : "bg-black/70 hover:bg-black/90 border-white/20 hover:border-white/40"
                          )}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCompareToggle();
                          }}
                          disabled={isAddingToCompare}
                        >
                          {isAddingToCompare ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <BarChart2 className="h-5 w-5" />
                          )}
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-black/90 text-white border-zinc-700 shadow-xl">
                      <p>{isInCompare(product.id) ? "Remove from comparison" : "Add to comparison"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {/* Favorite button with heart animation */}
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
                            "w-10 h-10 rounded-full shadow-xl backdrop-blur-md border-2 transition-all duration-300",
                            isFavorite 
                              ? "bg-red-500/90 text-white border-red-400/50" 
                              : "bg-black/70 hover:bg-black/90 border-white/20 hover:border-white/40"
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
                            <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
                          </motion.div>
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-black/90 text-white border-zinc-700 shadow-xl">
                      <p>{isFavorite ? "Remove from wishlist" : "Add to wishlist"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </Link>

          {/* Product info section with enhanced styling */}
          <motion.div 
            className="p-7 pt-6 space-y-4 relative bg-gradient-to-b from-zinc-900/70 to-black rounded-b-xl flex-grow flex flex-col"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {/* Rating stars with hover animation */}
            <motion.div 
              className="flex justify-center gap-1.5"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              {[1, 2, 3, 4, 5].map((_, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0.8, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.06 }}
                >
                  <Star className="h-4 w-4 text-primary fill-primary drop-shadow-md" />
                </motion.div>
              ))}
            </motion.div>

            {/* Product name with enhanced hover effect */}
            <Link href={`/product/${product.id}`} className="block group">
              <motion.h3 
                className="font-medium text-base md:text-lg tracking-wide text-white text-center line-clamp-2 min-h-[3rem] transition-colors duration-300 group-hover:text-primary/90 relative overflow-hidden"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <span className="relative inline-block">
                  {product.name.toUpperCase()}
                  <motion.span 
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-primary/70 rounded-full transform scale-x-0 origin-left"
                    animate={{ scaleX: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  />
                </span>
              </motion.h3>
            </Link>
            
            {/* Product description with improved readability */}
            <motion.p 
              className="text-sm leading-relaxed text-zinc-300 tracking-wide text-center line-clamp-2 min-h-[2.5rem] opacity-80 hover:opacity-100 transition-opacity duration-300"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
            >
              {product.description}
            </motion.p>
            
            {/* Price display with enhanced animation */}
            <div className="flex flex-col items-center gap-1.5 mt-1">
              <span className="text-xs text-zinc-400 uppercase tracking-wide font-medium">Price</span>
              <motion.div
                className="relative"
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
              >
                {/* Glow effect behind price */}
                <div className="absolute inset-0 bg-primary/20 blur-md rounded-full transform scale-110" />
                
                <div className="relative font-semibold text-xl md:text-2xl text-primary tracking-wider font-serif bg-clip-text bg-gradient-to-r from-primary to-primary-light">
                  {formatPrice(product.price)}
                </div>
              </motion.div>
            </div>
            
            {/* Add to cart button - Enhanced with rich animations and feedback */}
            <div className="pt-5 mt-auto perspective-800">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97, y: 2 }}
                transition={{ 
                  duration: 0.3, 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 15 
                }}
                className="relative"
              >
                {/* Animated glow effect around button */}
                <motion.div 
                  className="absolute inset-0 bg-primary/30 blur-xl rounded-2xl"
                  animate={{ 
                    scale: isHovered ? [1, 1.15, 1.05] : 1,
                    opacity: isHovered ? [0.4, 0.7, 0.4] : 0.2
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: isHovered ? Infinity : 0,
                    repeatType: "reverse"
                  }}
                />
                
                <Button 
                  variant="default"
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary/90 via-primary to-primary/90 hover:from-primary hover:to-primary text-black dark:text-black font-bold uppercase tracking-wider border-0 shadow-lg hover:shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 py-6 text-sm rounded-lg overflow-hidden relative z-10"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                >
                  {/* Animated background pulse and shine effects */}
                  <motion.div 
                    className="absolute inset-0 bg-white/20 skew-x-12 opacity-0"
                    animate={isHovered ? {
                      x: ["100%", "-100%"],
                      opacity: [0, 0.3, 0]
                    } : {}}
                    transition={{ 
                      duration: 1.5,
                      repeat: isHovered ? Infinity : 0,
                      repeatDelay: 0.5
                    }}
                  />
                  
                  {isAddingToCart ? (
                    <div className="flex items-center justify-center gap-2 relative z-10">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="font-bold tracking-wider">ADDING TO CART...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 relative z-10">
                      <ShoppingCart className="h-5 w-5" strokeWidth={2.5} />
                      <span className="font-bold tracking-wider">ADD TO CART</span>
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