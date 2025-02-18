import { useState } from "react";
import { CityMap } from "./city-map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CitySelectorProps {
  onCitySelect: (city: string) => void;
  selectedCity?: string;
}

export function CitySelector({ onCitySelect, selectedCity }: CitySelectorProps) {
  return (
    <Card className="border-none bg-card/50 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Select Your City</CardTitle>
      </CardHeader>
      <CardContent>
        <CityMap onCitySelect={onCitySelect} selectedCity={selectedCity} />
        <p className="text-xs text-center text-muted-foreground mt-4">
          Select your delivery city to see accurate delivery times and shipping rates
        </p>
      </CardContent>
    </Card>
  );
}