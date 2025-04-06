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
      transition={{ duration: 0.4 }}
      className="w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="border border-zinc-800/50 overflow-hidden group rounded-lg hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 bg-gradient-to-b from-zinc-900 to-black">
        <CardContent className="p-0">
          <Link href={`/product/${product.id}`}>
            <div className="relative">
              {/* Premium badge for luxury products */}
              {product.collection === 'luxury' && (
                <Badge className="absolute top-4 right-4 z-10 bg-primary/90 backdrop-blur-sm text-black font-medium px-3 py-1 uppercase tracking-wider text-xs shadow-md">
                  <Crown className="h-3.5 w-3.5 mr-1.5" /> Premium
                </Badge>
              )}
              
              {hasMultipleImages ? (
                <ProductImageGallery 
                  images={product.images} 
                  alt={product.name}
                  showThumbnails={false}
                  className="aspect-square w-full max-h-[300px]" 
                />
              ) : (
                <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-zinc-900/80 to-black w-full max-h-[300px]">
                  {/* Background pattern */}
                  <div className="absolute inset-0 bg-[url('/images/dark-texture.svg')] opacity-20" />
                  
                  {/* Product Image */}
                  <motion.div
                    className="relative z-10 h-full w-full p-4"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    <AdaptiveImage
                      src={product.images?.[0] || ""}
                      alt={product.name}
                      className="w-full h-full object-contain object-center transition-transform duration-500"
                      containerClassName="h-full w-full"
                    />
                  </motion.div>
                  
                  {/* Overlay on hover */}
                  <motion.div 
                    className="absolute inset-0 bg-black/70 backdrop-blur-sm opacity-0 transition-opacity duration-500 flex items-center justify-center z-20"
                    animate={{ opacity: isHovered ? 0.7 : 0 }}
                  >
                    <motion.div 
                      className="flex gap-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <Button
                        size="sm"
                        variant="secondary"
                        className="border border-white/30 text-white hover:bg-white/10 backdrop-blur-md transition-all duration-300 px-4 shadow-lg"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Eye className="h-4 w-4" />
                          <span>QUICK VIEW</span>
                        </div>
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-primary/90 text-black dark:text-black font-bold hover:bg-primary/100 hover:shadow-lg shadow-md shadow-primary/30 backdrop-blur-md transition-all duration-300 transform hover:scale-105 px-4 py-2 text-xs"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToCart();
                        }}
                        disabled={isAddingToCart}
                      >
                        {isAddingToCart ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span className="font-bold">ADDING...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5">
                            <ShoppingCart className="h-3.5 w-3.5" strokeWidth={2.5} />
                            <span className="font-bold">ADD TO CART</span>
                          </div>
                        )}
                      </Button>
                    </motion.div>
                  </motion.div>
                </div>
              )}
              
              {/* Action buttons */}
              <div className="absolute top-4 left-4 z-30 flex flex-col gap-2.5">
                {/* Compare button */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant={isInCompare(product.id) ? "default" : "secondary"}
                        className={cn(
                          "w-9 h-9 rounded-full shadow-lg backdrop-blur-md",
                          isInCompare(product.id) 
                            ? "bg-primary/90 text-primary-foreground" 
                            : "bg-black/60 hover:bg-black/80 border border-white/20"
                        )}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCompareToggle();
                        }}
                        disabled={isAddingToCompare}
                      >
                        {isAddingToCompare ? (
                          <Loader2 className="h-4.5 w-4.5 animate-spin" />
                        ) : (
                          <BarChart2 className="h-4.5 w-4.5" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{isInCompare(product.id) ? "Remove from comparison" : "Add to comparison"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {/* Favorite button */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="secondary"
                        className={cn(
                          "w-9 h-9 rounded-full shadow-lg backdrop-blur-md",
                          isFavorite 
                            ? "bg-red-500/90 text-white" 
                            : "bg-black/60 hover:bg-black/80 border border-white/20"
                        )}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsFavorite(!isFavorite);
                        }}
                      >
                        <Heart className={cn("h-4.5 w-4.5", isFavorite && "fill-current")} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{isFavorite ? "Remove from wishlist" : "Add to wishlist"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </Link>

          <motion.div 
            className="p-7 space-y-4 relative bg-gradient-to-b from-zinc-900/70 to-black rounded-b-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {/* Rating stars */}
            <div className="flex justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((_, index) => (
                <Star key={index} className="h-4 w-4 text-primary fill-primary" />
              ))}
            </div>

            {/* Product name with hover effect */}
            <Link href={`/product/${product.id}`}>
              <h3 className="font-medium text-base tracking-wide text-white text-center line-clamp-2 min-h-[3rem] transition-colors duration-300 hover:text-primary/90">
                {product.name.toUpperCase()}
              </h3>
            </Link>
            
            {/* Product description */}
            <p className="text-sm leading-relaxed text-zinc-300 tracking-wide text-center line-clamp-2 min-h-[2.5rem]">
              {product.description}
            </p>
            
            {/* Price display */}
            <div className="flex flex-col items-center gap-1.5 mt-1">
              <span className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Price</span>
              <motion.div
                className="font-semibold text-xl text-primary tracking-wider"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                {formatPrice(product.price)}
              </motion.div>
            </div>
            
            {/* Add to cart button - Enhanced for better visibility and fixed overflow */}
            <div className="pt-5">
              <Button 
                variant="default"
                size="lg"
                className="w-full bg-primary/90 hover:bg-primary text-black dark:text-black font-bold uppercase tracking-wider border-0 shadow-lg hover:shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 py-6 text-sm transform hover:scale-102"
                onClick={handleAddToCart}
                disabled={isAddingToCart}
              >
                {isAddingToCart ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="font-bold">ADDING TO CART...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <ShoppingCart className="h-5 w-5" strokeWidth={2.5} />
                    <span className="font-bold">ADD TO CART</span>
                  </div>
                )}
              </Button>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}