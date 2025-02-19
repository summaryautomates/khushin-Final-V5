import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Product } from "@shared/schema";

interface CartItemProps {
  product: Product;
  quantity: number;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}

export function CartItem({ product, quantity, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        {/* Product Image */}
        <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden">
          <img 
            src={Array.isArray(product.images) && product.images.length > 0 
              ? product.images[0] 
              : '/placeholder.jpg'} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1">
          <h3 className="font-medium">{product.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
          <p className="text-lg font-semibold mt-1">₹{product.price}</p>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onUpdateQuantity(product.id, Math.max(0, quantity - 1))}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onUpdateQuantity(product.id, quantity + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Remove Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => onRemove(product.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}