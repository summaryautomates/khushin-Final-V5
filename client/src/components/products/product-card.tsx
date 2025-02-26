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
import { Eye, ShoppingCart, Loader2, Scale, Crown, Star } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useCompare } from "@/hooks/use-compare";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

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
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [, setLocation] = useLocation();

  const getProductImage = () => {
    if (!imageError && product.images && Array.isArray(product.images) && product.images.length > 0) {
      const image = product.images[0];
      if (image && typeof image === 'string' && image.trim() !== '') {
        return image;
      }
    }
    return FALLBACK_IMAGES[fallbackIndex];
  };

  const handleImageError = () => {
    console.error('Image failed to load:', getProductImage());
    setImageError(true);
    setImageLoading(false);

    // Try next fallback image
    setFallbackIndex(prev => {
      if (prev < FALLBACK_IMAGES.length - 1) {
        return prev + 1;
      }
      return prev;
    });
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

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

  const handleCompareToggle = () => {
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
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden border-none shadow-xl group bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.05] transition-all duration-700">
        <CardHeader className="p-0">
          <motion.div
            className="relative aspect-square overflow-hidden bg-zinc-900 rounded-t-xl"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            {/* Premium Badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="absolute top-4 left-4 z-10"
            >
              <Badge variant="secondary" className="bg-gold/80 text-black backdrop-blur-sm flex items-center gap-1">
                <Crown className="h-3 w-3" />
                Premium
              </Badge>
            </motion.div>

            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
            <motion.img
              src={getProductImage()}
              alt={product.name}
              className="h-full w-full object-cover opacity-90 transition-opacity duration-700 group-hover:opacity-100"
              initial={{ scale: 1.1 }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              onError={handleImageError}
              onLoad={handleImageLoad}
              style={{
                opacity: imageLoading ? 0 : 1,
                transition: 'opacity 0.3s ease-in-out'
              }}
            />
            <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Link href={`/product/${product.id}`}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="icon"
                    variant="secondary"
                    className="rounded-full bg-orange-400/90 hover:bg-orange-500 text-white backdrop-blur-sm"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </motion.div>
              </Link>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="icon"
                  variant="secondary"
                  className={`rounded-full bg-white/80 text-black hover:bg-white backdrop-blur-sm ${
                    isInCompare(product.id) ? 'border-2 border-primary' : ''
                  }`}
                  onClick={handleCompareToggle}
                >
                  <Scale className={`h-4 w-4 ${isInCompare(product.id) ? 'text-primary' : ''}`} />
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="icon"
                  variant="secondary"
                  className="rounded-full bg-white/80 text-black hover:bg-white backdrop-blur-sm"
                  onClick={handleBuyNow}
                  disabled={isAddingToCart}
                >
                  {isAddingToCart ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShoppingCart className="h-4 w-4" />
                  )}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            {/* Rating Stars */}
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((_, index) => (
                <Star key={index} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              ))}
            </div>

            <h3 className="font-extralight text-lg tracking-widest text-white">
              {product.name}
            </h3>
            <p className="text-sm leading-relaxed text-zinc-400 tracking-wide line-clamp-2">
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