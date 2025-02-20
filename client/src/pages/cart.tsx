import { useState } from "react";
import {
  type ShippingFormData,
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

  const { toast } = useToast();
  const { items, total, updateQuantity, removeItem, isLoading, pendingUpdates } = useCart();

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity === 0) {
      handleRemoveItem(productId);
      return;
    }
    updateQuantity(productId, quantity);
  };

  const handleRemoveItem = (productId: number) => {
    removeItem(productId);
  };

  const cartTotal = total;
  const shippingCost = cartTotal >= 5000 ? 0 : 599;
  const orderTotal = cartTotal + shippingCost;

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setShippingMethod("express");
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
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          shipping: {
            fullName: "",
            address: "",
            city: selectedCity,
            state: "",
            pincode: "",
            phone: "",
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Checkout failed");
      }

      const { redirectUrl } = await response.json();
      window.location.href = redirectUrl;
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout Error",
        description: "An error occurred during checkout. Please try again.",
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
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}