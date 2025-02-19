import { useState } from "react";
import { ShippingForm, type ShippingFormData } from "@/components/checkout/shipping-form";
import { CitySelector } from "@/components/checkout/city-selector";
import { DeliveryScheduler } from "@/components/checkout/delivery-scheduler";
import { CartItem, type CartItemData } from "@/components/checkout/cart-item";
import { Truck, Clock, Shield, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";

import { ErrorBoundary } from "@/components/error-boundary";


export default function Cart() {
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | undefined>();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express' | 'international'>('standard');
  const [deliverySchedule, setDeliverySchedule] = useState<{
    date: string;
    timeSlot: string;
  } | null>(null);

  const { toast } = useToast();
  const { items, total, updateQuantity, removeItem, isLoading } = useCart();

  const cartItems: CartItemData[] = items.map(item => ({
    id: item.product.id.toString(),
    name: item.product.name,
    price: item.product.price,
    quantity: item.quantity,
    image: item.product.image || '/placeholder.jpg',
    description: item.product.description,
    sku: item.product.sku
  }));

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      handleRemoveItem(id);
      return;
    }
    updateQuantity(parseInt(id), quantity);
  };

  const handleRemoveItem = (id: string) => {
    removeItem(parseInt(id));
  };

  const cartTotal = total;
  const shippingCost = cartTotal >= 5000 ? 0 : 599;
  const orderTotal = cartTotal + shippingCost;

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setShippingMethod('express');
  };

  const handleCheckout = async () => {
    if (!selectedCity) {
      toast({
        title: "Please select a delivery city",
        description: "Select your city to continue with checkout",
        variant: "destructive",
      });
      return;
    }

    if (!deliverySchedule) {
      toast({
        title: "Please select delivery time",
        description: "Choose your preferred delivery date and time slot",
        variant: "destructive",
      });
      return;
    }

    setIsCheckingOut(true);
    // Add your checkout logic here
    setIsCheckingOut(false);
  };

  if (isLoading) {
    return (
      <div className="container py-8 min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="container py-8 min-h-screen max-w-7xl mx-auto px-4">
        {!showShippingForm ? (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <h1 className="text-3xl font-semibold">Shopping Cart</h1>

              {cartItems.length === 0 ? (
                <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
                  <p className="text-muted-foreground text-center">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map(item => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemove={handleRemoveItem}
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      className={`w-full h-20 relative overflow-hidden transition-all ${
                        shippingMethod === 'express'
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'hover:border-primary'
                      }`}
                      onClick={() => {
                        setShippingMethod('express');
                        setShowShippingForm(true);
                      }}
                    >
                      <div className="absolute inset-0 bg-primary/5" />
                      <div className="relative flex items-center justify-between w-full px-4">
                        <div className="flex items-center gap-4">
                          <Truck className={`h-8 w-8 ${
                            shippingMethod === 'express' ? 'text-primary-foreground' : 'text-primary'
                          }`} />
                          <div className="text-left">
                            <p className="font-semibold text-lg">Express Delivery</p>
                            <p className="text-sm opacity-80">1-2 business days</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-lg">
                            {cartTotal >= 5000 ? 'Free' : '₹599'}
                          </p>
                        </div>
                      </div>
                    </Button>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5">
                        <Clock className="h-5 w-5 text-primary" />
                        <span className="font-medium">Fast Delivery</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5">
                        <Shield className="h-5 w-5 text-primary" />
                        <span className="font-medium">Full Insurance</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-6 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{cartTotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{cartTotal >= 5000 ? 'Free' : '₹599'}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>₹{orderTotal}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => setShowShippingForm(true)}
                    disabled={isCheckingOut || cartItems.length === 0}
                  >
                    {isCheckingOut ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      'PROCEED TO CHECKOUT'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2 items-start">
            <div className="space-y-6">
              <Button
                variant="ghost"
                size="sm"
                className="mb-4"
                onClick={() => setShowShippingForm(false)}
              >
                ← Back to Cart
              </Button>

              <div className="rounded-lg border p-6 space-y-6 bg-card">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Delivery Location
                  </h3>
                  {selectedCity && (
                    <span className="text-sm text-muted-foreground">
                      Express delivery available
                    </span>
                  )}
                </div>
                <CitySelector
                  selectedCity={selectedCity}
                  onCitySelect={handleCitySelect}
                />
              </div>

              {selectedCity && (
                <div className="rounded-lg border p-6 space-y-6 bg-card">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Delivery Schedule
                  </h3>
                  <DeliveryScheduler
                    onScheduleSelect={(date, timeSlot) => {
                      setDeliverySchedule({
                        date: date.toISOString(),
                        timeSlot
                      });
                    }}
                  />
                </div>
              )}

              {selectedCity && deliverySchedule && (
                <div className="rounded-lg border p-6 bg-card">
                  <ShippingForm
                    onSubmit={(data) => {
                      console.log('Shipping form data:', data);
                      handleCheckout();
                    }}
                    isLoading={isCheckingOut}
                  />
                </div>
              )}
            </div>

            <div className="lg:sticky lg:top-8 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.name} × {item.quantity}
                      </span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{cartTotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{cartTotal >= 5000 ? 'Free' : '₹599'}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>₹{orderTotal}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}