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
import { Input } from "@/components/ui/input";

const calculateShippingCost = (subtotal: number, shippingMethod: 'standard' | 'express' | 'international' = 'standard'): number => {
  if (subtotal >= 5000) return 0; // Free shipping over ₹5000

  switch (shippingMethod) {
    case 'express':
      return 599;
    case 'international':
      return 1499; // Base rate for international shipping
    default:
      return 299; // Standard shipping
  }
};

export default function Cart() {
  const cart = useCart();
  const { toast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showShippingForm, setShowShippingForm] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('checkout') === 'true';
  });
  const [shippingAddress, setShippingAddress] = useState<ShippingFormData | null>(null);
  const [discountCode, setDiscountCode] = useState("");
  const [discountedTotal, setDiscountedTotal] = useState<number | null>(null);
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express' | 'international'>('standard');

  const subtotal = cart.total;
  const shippingCost = calculateShippingCost(subtotal, shippingMethod);
  const total = subtotal + shippingCost + (cart.giftWrap.cost || 0);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 99) {
      cart.updateQuantity(productId, newQuantity);
    }
  };

  const handleShippingSubmit = async (data: ShippingFormData) => {
    setShippingAddress(data);
    handleCheckout(data);
  };

  const handleDiscountSubmit = async () => {
    try {
      const response = await fetch('/api/validate-discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode })
      });

      if (!response.ok) {
        toast({
          title: "Error",
          description: "Invalid discount code",
          variant: "destructive"
        });
        return;
      }

      const { discountPercent } = await response.json();
      toast({
        description: `Discount code applied: ${discountPercent}% off`,
      });

      // Apply discount to cart total
      const discountAmount = (subtotal * discountPercent) / 100;
      setDiscountedTotal(subtotal - discountAmount);
    } catch (error) {
      console.error('Error applying discount:', error);
      toast({
        title: "Error",
        description: "Failed to apply discount code",
        variant: "destructive"
      });
    }
  };

  const handleCheckout = async (shippingData?: ShippingFormData) => {
    try {
      setIsCheckingOut(true);
      const items = cart.items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }));

      const checkoutData = {
        items,
        shipping: shippingData || shippingAddress,
        shippingMethod: shippingMethod,
        giftWrap: cart.giftWrap
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

  if (cart.items.length === 0) {
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
    <div className="container py-4 min-h-screen max-w-7xl">
      {!showShippingForm ? (
        <div className="space-y-8">
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
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
                          <div className="mt-4 flex items-center space-x-4">
                            <div className="flex items-center border rounded-lg p-1"> {/* Added padding and a border */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-none h-8 w-8 hover:bg-gray-100"
                                onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <div className="relative w-12">
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    const num = parseInt(val) || 1;
                                    if (num >= 1 && num <= 99) {
                                      handleQuantityChange(item.product.id, num);
                                    }
                                  }}
                                  className="w-full h-8 text-center border-none focus:ring-0 focus:outline-none bg-transparent text-foreground hover:bg-accent/50 transition-colors"
                                  min="1"
                                  max="99"
                                />
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-none h-8 w-8 hover:bg-gray-100"
                                onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive/90"
                              onClick={() => cart.removeItem(item.product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">Adjust quantity or remove item</p> {/* Added subtle instruction */}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4 border-b pb-4">
                    <h3 className="font-medium">Gift Wrapping Options</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="gift-wrap"
                            value="none"
                            checked={!cart.giftWrap.type}
                            onChange={() => cart.updateGiftWrap(null, 0)}
                            className="rounded-full"
                          />
                          <span>No gift wrap</span>
                        </label>
                        <span>Free</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="gift-wrap"
                            value="standard"
                            checked={cart.giftWrap.type === 'standard'}
                            onChange={() => cart.updateGiftWrap('standard', 199)}
                            className="rounded-full"
                          />
                          <span>Standard Wrap</span>
                        </label>
                        <span>{formatPrice(199)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="gift-wrap"
                            value="premium"
                            checked={cart.giftWrap.type === 'premium'}
                            onChange={() => cart.updateGiftWrap('premium', 399)}
                            className="rounded-full"
                          />
                          <span>Premium Wrap</span>
                        </label>
                        <span>{formatPrice(399)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="gift-wrap"
                            value="luxury"
                            checked={cart.giftWrap.type === 'luxury'}
                            onChange={() => cart.updateGiftWrap('luxury', 699)}
                            className="rounded-full"
                          />
                          <span>Luxury Gift Box</span>
                        </label>
                        <span>{formatPrice(699)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t pt-4 space-y-4">
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
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>{formatPrice(discountedTotal || total)}</span>
                    </div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                        required
                      />
                      <span className="text-sm text-muted-foreground">
                        I agree with the terms and conditions
                      </span>
                    </label>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col">
                  <Button
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-black"
                    onClick={() => handleCheckout()}
                  >
                    CHECK OUT
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                onClick={() => setShowShippingForm(false)}
                className="px-0 h-7 hover:bg-transparent"
              >
                ← Return to cart
              </Button>
              <div className="h-5 w-px bg-border/60" />
              <span className="text-sm text-muted-foreground">Bhawar Sales Corporation</span>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border p-4 space-y-4">
                <h3 className="font-medium">Shipping Method</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="shipping-method"
                        value="standard"
                        checked={shippingMethod === 'standard'}
                        onChange={(e) => setShippingMethod('standard')}
                        className="rounded-full"
                      />
                      <div>
                        <p className="font-medium">Standard Shipping</p>
                        <p className="text-sm text-muted-foreground">3-5 business days</p>
                      </div>
                    </div>
                    <span className="font-medium">{subtotal >= 5000 ? 'Free' : formatPrice(299)}</span>
                  </label>

                  <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="shipping-method"
                        value="express"
                        checked={shippingMethod === 'express'}
                        onChange={(e) => setShippingMethod('express')}
                        className="rounded-full"
                      />
                      <div>
                        <p className="font-medium">Express Shipping</p>
                        <p className="text-sm text-muted-foreground">1-2 business days</p>
                      </div>
                    </div>
                    <span className="font-medium">{subtotal >= 5000 ? 'Free' : formatPrice(599)}</span>
                  </label>

                  <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="shipping-method"
                        value="international"
                        checked={shippingMethod === 'international'}
                        onChange={(e) => setShippingMethod('international')}
                        className="rounded-full"
                      />
                      <div>
                        <p className="font-medium">International Shipping</p>
                        <p className="text-sm text-muted-foreground">7-14 business days</p>
                      </div>
                    </div>
                    <span className="font-medium">Calculated at checkout</span>
                  </label>
                </div>

                <div className="mt-4 p-3 bg-accent/50 rounded-lg">
                  <h4 className="font-medium mb-2">Shipping Policies</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• All orders are insured and tracked</li>
                    <li>• Free shipping on orders over ₹5,000</li>
                    <li>• Signature required for valuable items</li>
                    <li>• Real-time tracking updates</li>
                    <li>• Premium packaging for protection</li>
                  </ul>
                </div>
              </div>

              <ShippingForm onSubmit={handleShippingSubmit} isLoading={isCheckingOut} />
            </div>
          </div>

          <div className="lg:pl-6">
            <div className="sticky top-24 space-y-4">
              <div className="rounded border bg-card">
                <div className="p-3 space-y-3">
                  {cart.items.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-14 h-14 rounded border overflow-hidden bg-zinc-50">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-contain p-2"
                          />
                        </div>
                        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium truncate">{item.product.name}</h3>
                        <p className="text-xs text-muted-foreground">{formatPrice(item.product.price)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatPrice(item.product.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t p-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Discount code"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      className="h-8 text-sm"
                    />
                    <Button variant="outline" className="h-8" onClick={handleDiscountSubmit}>
                      Apply
                    </Button>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      {subtotal >= 5000 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        <span>{formatPrice(shippingCost)}</span>
                      )}
                    </div>
                    <div className="flex justify-between font-medium pt-1.5 border-t text-sm">
                      <span>Total</span>
                      <span>{formatPrice(discountedTotal || total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}