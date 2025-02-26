import { useState } from "react";
import { CityMap } from "./city-map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

const MAJOR_CITIES = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Surat",
  "Lucknow",
  "Kanpur",
  "Nagpur",
  "Indore",
  "Thane",
  "Bhopal",
] as const;

interface CitySelectorProps {
  onCitySelect: (city: string) => void;
  selectedCity?: string;
}

export function CitySelector({ onCitySelect, selectedCity }: CitySelectorProps) {
  const [error, setError] = useState<string | null>(null);

  const handleCitySelect = (city: string) => {
    setError(null);
    onCitySelect(city);
  };

  return (
    <Card className="border-none bg-card/50 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Select Your City
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <CityMap 
            onCitySelect={handleCitySelect} 
            selectedCity={selectedCity} 
            availableCities={MAJOR_CITIES}
          />
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <p className="text-xs text-center text-muted-foreground">
            Select your delivery city to see accurate delivery times and shipping rates
          </p>
        </div>
      </CardContent>
    </Card>
  );
}