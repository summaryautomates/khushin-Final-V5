
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CitySelector } from "@/components/checkout/city-selector";
import { DeliveryScheduler } from "@/components/checkout/delivery-scheduler";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Truck, Clock, MapPin } from "lucide-react";

export default function ExpressDelivery() {
  const [selectedCity, setSelectedCity] = useState<string>();
  const [deliverySchedule, setDeliverySchedule] = useState<{
    date: string;
    timeSlot: string;
  } | null>(null);
  const [, setLocation] = useLocation();

  const handleContinue = () => {
    if (selectedCity && deliverySchedule) {
      setLocation('/cart');
    }
  };

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-light mb-8 tracking-tight">Express Delivery Service</h1>
      
      <div className="grid gap-6">
        <Card className="border-none bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Instant Delivery Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Get your luxury lighter delivered within 2-4 hours in selected cities.
              Our express delivery service ensures your gift reaches its destination quickly and safely.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <CitySelector onCitySelect={setSelectedCity} selectedCity={selectedCity} />
          
          {selectedCity && (
            <DeliveryScheduler
              onScheduleSelect={(date, timeSlot) => {
                setDeliverySchedule({
                  date: date.toISOString(),
                  timeSlot
                });
              }}
            />
          )}
        </div>

        <Button 
          className="w-full max-w-sm mx-auto mt-4"
          size="lg"
          disabled={!selectedCity || !deliverySchedule}
          onClick={handleContinue}
        >
          Continue to Cart
        </Button>
      </div>
    </div>
  );
}
