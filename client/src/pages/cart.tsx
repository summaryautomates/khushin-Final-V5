import { useState, useEffect } from "react";
import {
  type ShippingFormData,
  ShippingForm,
} from "@/components/checkout/shipping-form";
import { CitySelector } from "@/components/checkout/city-selector";
import { DeliveryScheduler } from "@/components/checkout/delivery-scheduler";
import { CartItem } from "@/components/checkout/cart-item";
import { Truck, Clock, Shield, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { ErrorBoundary } from "@/components/error-boundary";

export default function Cart() {
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | undefined>();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<
    "standard" | "express" | "international"
  >("standard");
  const [deliverySchedule, setDeliverySchedule] = useState<{
    date: string;
    timeSlot: string;
  } | null>(null);
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(null);

  const { toast } = useToast();
  const { items, total, updateQuantity, removeItem, isLoading, pendingUpdates, error } = useCart();

  // Show error toast if cart loading fails
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load cart items. Please try refreshing the page.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleUpdateQuantity = async (productId: number, quantity: number) => {
    try {
      if (quantity === 0) {
        await handleRemoveItem(productId);
        return;
      }
      await updateQuantity(productId, quantity);
    } catch (error) {
      console.error("Failed to update quantity:", error);
      toast({
        title: "Error",
        description: "Failed to update quantity. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveItem = async (productId: number) => {
    try {
      await removeItem(productId);
    } catch (error) {
      console.error("Failed to remove item:", error);
      toast({
        title: "Error",
        description: "Failed to remove item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const cartTotal = total;
  const shippingCost = cartTotal >= 5000 ? 0 : 599;
  const orderTotal = cartTotal + shippingCost;

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setShippingMethod("express");
  };

  const handleShippingSubmit = (data: ShippingFormData) => {
    setShippingData(data);
    setShowShippingForm(false);
  };

  const handleDeliveryScheduleChange = (value: { date: string; timeSlot: string } | null) => {
    setDeliverySchedule(value);
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

    if (!shippingData) {
      setShowShippingForm(true);
      toast({
        title: "Please provide shipping details",
        description: "Fill in your shipping information to continue",
        variant: "destructive",
      });
      return;
    }

    setIsCheckingOut(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          shipping: {
            ...shippingData,
            city: selectedCity,
            delivery: deliverySchedule,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Checkout failed");
      }

      const { redirectUrl } = await response.json();
      window.location.href = redirectUrl;
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout Error",
        description: error instanceof Error ? error.message : "An error occurred during checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingOut(false);
    }
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
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="lg:col-span-1 space-y-8">
            <h1 className="text-3xl font-semibold">Shopping Cart</h1>
            {items.length === 0 ? (
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
                <p className="text-muted-foreground text-center">
                  Your cart is empty
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItem
                    key={item.product.id}
                    product={item.product}
                    quantity={item.quantity}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                    isUpdating={pendingUpdates.has(item.product.id)}
                  />
                ))}
              </div>
            )}

            {items.length > 0 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Delivery Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CitySelector
                      selectedCity={selectedCity}
                      onCitySelect={handleCitySelect}
                    />
                  </CardContent>
                </Card>

                {selectedCity && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Delivery Schedule
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DeliveryScheduler
                        value={deliverySchedule}
                        onChange={handleDeliveryScheduleChange}
                      />
                    </CardContent>
                  </Card>
                )}

                {showShippingForm && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        Shipping Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ShippingForm onSubmit={handleShippingSubmit} isLoading={isCheckingOut} />
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-8 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-muted-foreground">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span>₹{item.product.price * item.quantity}</span>
                  </div>
                ))}
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{cartTotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{cartTotal >= 5000 ? "Free" : "₹599"}</span>
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
                  onClick={handleCheckout}
                  disabled={isCheckingOut || items.length === 0}
                >
                  {isCheckingOut ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "PROCEED TO CHECKOUT"
                  )}
                </Button>
              </CardFooter>
            </Card>

            {items.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Secure checkout powered by Stripe</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}