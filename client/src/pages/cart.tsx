import { useState } from "react";
import { ShippingForm, type ShippingFormData } from "@/components/checkout/shipping-form";
import { Input } from "@/components/ui/input";
import { CitySelector } from "@/components/checkout/city-selector";
import { DeliveryScheduler } from "@/components/checkout/delivery-scheduler";
import { Truck, Clock, Shield, MapPin, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

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

  // Mock cart data - replace with actual cart state management
  const cart = {
    items: [],
    total: 4500,
    giftWrap: false
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    // Update shipping method to express for better UX
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

  return (
    <div className="container py-4 min-h-screen max-w-7xl">
      {!showShippingForm ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <h1 className="text-2xl font-semibold">Shopping Cart</h1>
            {/* Cart Items Here */}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4 border-b pb-4">
                  <Button
                    variant="outline"
                    className={`w-full h-16 relative overflow-hidden transition-all ${
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
                    <div className="relative flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <Truck className={`h-6 w-6 ${
                          shippingMethod === 'express' ? 'text-primary-foreground' : 'text-primary'
                        }`} />
                        <div className="text-left">
                          <p className="font-semibold">Express Delivery</p>
                          <p className="text-sm opacity-80">1-2 business days</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {cart.total >= 5000 ? 'Free' : '₹599'}
                        </p>
                      </div>
                    </div>
                  </Button>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>Fast Delivery</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5">
                      <Shield className="h-4 w-4 text-primary" />
                      <span>Full Insurance</span>
                    </div>
                  </div>
                </div>

                {/* Order Summary Details */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{cart.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{cart.total >= 5000 ? 'Free' : '₹599'}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>₹{cart.total + (cart.total >= 5000 ? 0 : 599)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => setShowShippingForm(true)}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'PROCEED TO CHECKOUT'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => setShowShippingForm(false)}
            >
              ← Back to Cart
            </Button>

            <div className="rounded-lg border p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
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
              <div className="rounded-lg border p-4 space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
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
              <ShippingForm
                onSubmit={(data) => {
                  console.log('Shipping form data:', data);
                  handleCheckout();
                }}
                isLoading={isCheckingOut}
              />
            )}
          </div>

          <div className="lg:sticky lg:top-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Order summary content */}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}