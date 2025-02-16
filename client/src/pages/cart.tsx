import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/products";
import { Minus, Plus, Trash2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { ShippingForm, type ShippingFormData } from "@/components/checkout/shipping-form";

// Shipping cost calculation
const calculateShippingCost = (subtotal: number): number => {
  if (subtotal >= 5000) return 0; // Free shipping over ₹5000
  return 299; // Standard shipping cost
};

export default function Cart() {
  const { state, removeItem, updateQuantity } = useCart();
  const { toast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingFormData | null>(null);

  const subtotal = state.total;
  const shippingCost = calculateShippingCost(subtotal);
  const total = subtotal + shippingCost;

  const handleShippingSubmit = async (data: ShippingFormData) => {
    setShippingAddress(data);
    handleCheckout(data);
  };

  const handleCheckout = async (shippingData?: ShippingFormData) => {
    try {
      setIsCheckingOut(true);
      const items = state.items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }));

      const checkoutData = {
        items,
        shipping: shippingData || shippingAddress,
      };

      const response = await apiRequest('POST', '/api/checkout', checkoutData);
      const { redirectUrl } = await response.json();

      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        throw new Error('Invalid checkout response');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        variant: "destructive",
        title: "Checkout Failed",
        description: "Could not process checkout. Please try again.",
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (state.items.length === 0) {
    return (
      <div className="container py-20 min-h-screen">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Your Cart is Empty</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Start shopping to add items to your cart.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <a href="/products">Browse Products</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-20 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {!showShippingForm ? (
            // Cart Items
            state.items.map((item) => (
              <motion.div
                key={item.product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-zinc-100 rounded-lg overflow-hidden">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.product.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.product.description}
                        </p>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => removeItem(item.product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.quantity} × {formatPrice(item.product.price)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            // Shipping Form
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent>
                <ShippingForm onSubmit={handleShippingSubmit} isLoading={isCheckingOut} />
              </CardContent>
            </Card>
          )}
        </div>
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                {subtotal >= 5000 ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  <span>{formatPrice(shippingCost)}</span>
                )}
              </div>
              {subtotal < 5000 && (
                <p className="text-sm text-muted-foreground">
                  Add {formatPrice(5000 - subtotal)} more for free shipping
                </p>
              )}
              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {!showShippingForm ? (
                <Button
                  className="w-full"
                  onClick={() => setShowShippingForm(true)}
                >
                  Proceed to Checkout
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowShippingForm(false)}
                >
                  Back to Cart
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}