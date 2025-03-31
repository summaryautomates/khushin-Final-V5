import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/products";
import type { Product } from "@shared/schema";
import { Eye, ShoppingCart, Loader2, Scale, Crown, Star, BarChart2 } from "lucide-react";
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <Card className="border-none overflow-hidden group bg-black hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
        <CardContent className="p-0">
          <Link href={`/product/${product.id}`}>
            {hasMultipleImages ? (
              <div className="relative">
                <ProductImageGallery 
                  images={product.images} 
                  alt={product.name}
                  showThumbnails={false}
                />
                {/* Compare button overlay for product gallery */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant={isInCompare(product.id) ? "default" : "secondary"}
                        className={cn(
                          "absolute top-2 left-2 z-10 w-8 h-8 rounded-full shadow-md",
                          isInCompare(product.id) ? "bg-primary text-primary-foreground" : "bg-zinc-900 hover:bg-zinc-800"
                        )}
                        onClick={handleCompareToggle}
                        disabled={isAddingToCompare}
                      >
                        {isAddingToCompare ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <BarChart2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{isInCompare(product.id) ? "Remove from comparison" : "Add to comparison"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ) : (
              <motion.div
                className="relative aspect-square overflow-hidden bg-black"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <AdaptiveImage
                  src={product.images?.[0] || ""}
                  alt={product.name}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  containerClassName="h-full w-full"
                />
                {/* Compare button overlay for regular product */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant={isInCompare(product.id) ? "default" : "secondary"}
                        className={cn(
                          "absolute top-2 left-2 z-10 w-8 h-8 rounded-full shadow-md",
                          isInCompare(product.id) ? "bg-primary text-primary-foreground" : "bg-zinc-900 hover:bg-zinc-800"
                        )}
                        onClick={handleCompareToggle}
                        disabled={isAddingToCompare}
                      >
                        {isAddingToCompare ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <BarChart2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{isInCompare(product.id) ? "Remove from comparison" : "Add to comparison"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </motion.div>
            )}
          </Link>

          <motion.div className={`p-6 space-y-4 ${product.name.toLowerCase().includes('lighter') ? 'relative' : ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {product.name.toLowerCase().includes('lighter') && (
              <div 
                className="absolute inset-0 opacity-40 z-0 bg-cover bg-center" 
                style={{ backgroundImage: 'url(/images/khush-lighters.jpg)' }}
                onError={(e) => {
                  console.error("Image failed to load");
                  e.currentTarget.style.backgroundImage = 'url(/images/luxury-lighters.jpg)';
                }}
              />
            )}
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((_, index) => (
                <Star key={index} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              ))}
            </div>

            <h3 className="font-extralight text-lg tracking-widest text-white line-clamp-2 min-h-[3.5rem]">
              {product.name}
            </h3>
            <p className="text-sm leading-relaxed text-zinc-400 tracking-wide line-clamp-2 min-h-[2.5rem]">
              {product.description}
            </p>
            <motion.div
              className="mt-4 font-light text-lg text-white tracking-wider"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              {formatPrice(product.price)}
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}