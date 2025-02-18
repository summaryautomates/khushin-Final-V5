import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export interface CartItemData {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  // Add optional fields that might be needed for specific product types
  description?: string;
  category?: string;
  sku?: string;
}

interface CartItemProps {
  item: CartItemData;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        {/* Product Image */}
        <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden">
          <img 
            src={item.image} 
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1">
          <h3 className="font-medium">{item.name}</h3>
          {item.description && (
            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
          )}
          {item.sku && (
            <p className="text-xs text-muted-foreground mt-1">SKU: {item.sku}</p>
          )}
          <p className="text-lg font-semibold mt-1">₹{item.price}</p>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center">{item.quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Remove Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => onRemove(item.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}