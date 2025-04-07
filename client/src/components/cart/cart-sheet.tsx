import { useState } from 'react';
import { useLocation } from 'wouter';
import { ShoppingCart, X, Trash2, Plus, Minus, Loader2, Gift } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth.tsx';
import { AuthSheet } from '@/components/auth/auth-sheet';
import { AdaptiveImage } from "@/components/ui/adaptive-image";

interface CartSheetProps {
  children?: React.ReactNode;
}

export function CartSheet({ children }: CartSheetProps) {
  const [open, setOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [, navigate] = useLocation();
  const { items, total, updateQuantity, removeItem, updateGiftStatus, pendingUpdates, isLoading } = useCart();
  const { user } = useAuth();

  const handleQuantityChange = async (productId: number, change: number, currentQuantity: number) => {
    try {
      const newQuantity = currentQuantity + change;
      if (newQuantity >= 1 && newQuantity <= 10) {
        await updateQuantity(productId, newQuantity);
      }
    } catch (error: any) {
      if (error.message === "AUTH_REQUIRED") {
        setIsAuthOpen(true);
      }
    }
  };

  const handleRemove = async (productId: number) => {
    try {
      await removeItem(productId);
    } catch (error: any) {
      if (error.message === "AUTH_REQUIRED") {
        setIsAuthOpen(true);
      }
    }
  };

  const handleGiftToggle = async (productId: number, isGift: boolean, giftMessage?: string) => {
    try {
      await updateGiftStatus(productId, isGift, giftMessage);
    } catch (error: any) {
      if (error.message === "AUTH_REQUIRED") {
        setIsAuthOpen(true);
      }
    }
  };

  const handleCheckout = () => {
    setOpen(false);
    navigate("/cart");
  };

  const cartTotal = total / 100;
  const formattedTotal = cartTotal.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          {children || (
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground w-5 h-5 rounded-full text-xs flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Button>
          )}
        </SheetTrigger>
        <SheetContent className="flex flex-col h-full w-full sm:max-w-md p-0">
          <SheetHeader className="p-6 pb-2">
            <div className="flex items-center justify-between">
              <SheetTitle>Shopping Cart</SheetTitle>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>
          <Separator />
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <ShoppingCart className="h-16 w-16 mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-6">
                Looks like you haven't added any products to your cart yet.
              </p>
              <Button onClick={() => {
                setOpen(false);
                navigate("/products");
              }}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  {items.map((item) => {
                    const isUpdating = pendingUpdates.has(item.product.id);
                    return (
                      <div key={item.product.id} className="flex gap-4">
                        <div className="w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          <AdaptiveImage
                            src={item.product.images?.[0] || ""}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                            containerClassName="h-full w-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-1">{item.product.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{item.product.category}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border rounded-md">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-none"
                                onClick={() => handleQuantityChange(item.product.id, -1, item.quantity)}
                                disabled={isUpdating || item.quantity <= 1}
                              >
                                {isUpdating ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Minus className="h-3 w-3" />
                                )}
                              </Button>
                              <span className="w-7 text-xs text-center">{item.quantity}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-none"
                                onClick={() => handleQuantityChange(item.product.id, 1, item.quantity)}
                                disabled={isUpdating || item.quantity >= 10}
                              >
                                {isUpdating ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Plus className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                            <div className="font-medium text-sm">
                              ₹{(item.product.price * item.quantity / 100).toLocaleString('en-IN')}
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`gift-${item.product.id}`}
                                checked={item.isGift}
                                onCheckedChange={(checked) => handleGiftToggle(item.product.id, checked, item.giftMessage)}
                                disabled={isUpdating}
                              />
                              <Label htmlFor={`gift-${item.product.id}`} className="text-xs flex items-center gap-1">
                                <Gift className="h-3 w-3" />
                                Gift
                              </Label>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => handleRemove(item.product.id)}
                              disabled={isUpdating}
                            >
                              {isUpdating ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
              <div className="p-6 pt-0 border-t bg-background">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">Subtotal</span>
                  <span className="text-sm font-medium">{formattedTotal}</span>
                </div>
                <SheetFooter className="mt-4">
                  <Button className="w-full" onClick={handleCheckout}>
                    Checkout
                  </Button>
                </SheetFooter>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      <AuthSheet open={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </>
  );
}