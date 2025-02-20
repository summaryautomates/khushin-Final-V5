import { Minus, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Product } from "@shared/schema";
import { useState, useEffect } from "react";

interface CartItemProps {
  product: Product;
  quantity: number;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
  isUpdating?: boolean;
}

export function CartItem({ 
  product, 
  quantity, 
  onUpdateQuantity, 
  onRemove,
  isUpdating = false 
}: CartItemProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset loading state when product changes
  useEffect(() => {
    setImageLoading(true);
    setImageError(false);
    setCurrentImageIndex(0);
  }, [product.id]);

  const handleIncrement = () => {
    if (quantity < 10 && !isUpdating) {
      onUpdateQuantity(product.id, quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1 && !isUpdating) {
      onUpdateQuantity(product.id, quantity - 1);
    }
  };

  const handleRemove = () => {
    if (!isUpdating) {
      onRemove(product.id);
    }
  };

  const handleImageError = () => {
    console.error('Failed to load image:', getProductImage());
    // Try next image if available
    if (currentImageIndex < product.images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    } else {
      setImageError(true);
    }
    setImageLoading(false);
  };

  const getProductImage = () => {
    if (Array.isArray(product.images) && product.images.length > currentImageIndex && !imageError) {
      const currentImage = product.images[currentImageIndex];
      if (currentImage && (currentImage.startsWith('http') || currentImage.startsWith('/'))) {
        return currentImage;
      }
    }
    return '/placeholder.jpg';  // Fallback image
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        {/* Product Image */}
        <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden relative">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
          <img 
            src={getProductImage()} 
            alt={product.name}
            className="w-full h-full object-cover"
            onError={handleImageError}
            onLoad={() => {
              console.log('Image loaded successfully:', getProductImage());
              setImageLoading(false);
            }}
            style={{ 
              opacity: imageLoading ? 0 : 1,
              transition: 'opacity 0.3s ease-in-out'
            }}
          />
        </div>

        {/* Product Details */}
        <div className="flex-1">
          <h3 className="font-medium">{product.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
          <p className="text-lg font-semibold mt-1">₹{(product.price / 100).toLocaleString('en-IN')}</p>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleDecrement}
            disabled={isUpdating || quantity <= 1}
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Minus className="h-4 w-4" />
            )}
          </Button>
          <span className="w-8 text-center">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleIncrement}
            disabled={isUpdating || quantity >= 10}
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Remove Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={handleRemove}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </Card>
  );
}