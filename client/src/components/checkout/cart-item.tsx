import { Minus, Plus, Trash2, Loader2, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Product } from "@shared/schema";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface CartItemProps {
  product: Product;
  quantity: number;
  isGift?: boolean;
  giftMessage?: string;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
  onUpdateGiftStatus?: (productId: number, isGift: boolean, giftMessage?: string) => void;
  isUpdating?: boolean;
}

export function CartItem({ 
  product, 
  quantity, 
  isGift = false,
  giftMessage = "",
  onUpdateQuantity, 
  onRemove,
  onUpdateGiftStatus,
  isUpdating = false 
}: CartItemProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [showGiftMessage, setShowGiftMessage] = useState(false);
  const [localGiftMessage, setLocalGiftMessage] = useState(giftMessage);

  const getProductImage = () => {
    if (Array.isArray(product.images) && product.images.length > 0) {
      const image = product.images[0];
      if (image && typeof image === 'string') {
        return image;
      }
    }
    return '/placeholder-product.svg';
  };

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

  const handleGiftToggle = (checked: boolean) => {
    if (onUpdateGiftStatus) {
      onUpdateGiftStatus(product.id, checked, checked ? localGiftMessage : undefined);
    }
  };

  const handleGiftMessageSave = () => {
    if (onUpdateGiftStatus) {
      onUpdateGiftStatus(product.id, isGift, localGiftMessage);
    }
    setShowGiftMessage(false);
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
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
            onError={() => setImageLoading(false)}
            onLoad={() => setImageLoading(false)}
            style={{ 
              opacity: imageLoading ? 0 : 1,
              transition: 'opacity 0.3s ease-in-out'
            }}
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 space-y-2">
          <div>
            <h3 className="font-medium">{product.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
            <p className="text-lg font-semibold mt-1">₹{(product.price / 100).toLocaleString('en-IN')}</p>
          </div>

          {/* Gift Toggle */}
          {onUpdateGiftStatus && (
            <div className="flex items-center space-x-2">
              <Switch
                id={`gift-toggle-${product.id}`}
                checked={isGift}
                onCheckedChange={handleGiftToggle}
                disabled={isUpdating}
              />
              <Label htmlFor={`gift-toggle-${product.id}`} className="flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Mark as Gift
              </Label>
              {isGift && (
                <Dialog open={showGiftMessage} onOpenChange={setShowGiftMessage}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="ml-2">
                      {giftMessage ? "Edit Message" : "Add Message"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Gift Message</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Textarea
                        placeholder="Enter your gift message here..."
                        value={localGiftMessage}
                        onChange={(e) => setLocalGiftMessage(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowGiftMessage(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleGiftMessageSave}>
                          Save Message
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )}
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