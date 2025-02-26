import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CityMapProps {
  onCitySelect: (city: string) => void;
  selectedCity?: string;
  availableCities: readonly string[];
}

interface CityInfo {
  id: string;
  name: string;
  coordinates: { x: number; y: number };
  deliveryTime: string;
}

const CITY_INFO: { [key: string]: CityInfo } = {
  "Mumbai": {
    id: "mumbai",
    name: "Mumbai",
    coordinates: { x: 25, y: 55 },
    deliveryTime: "1-2 days",
  },
  "Delhi": {
    id: "delhi",
    name: "Delhi",
    coordinates: { x: 28, y: 25 },
    deliveryTime: "2-3 days",
  },
  "Bangalore": {
    id: "bangalore",
    name: "Bangalore",
    coordinates: { x: 30, y: 65 },
    deliveryTime: "2-3 days",
  },
  "Hyderabad": {
    id: "hyderabad",
    name: "Hyderabad",
    coordinates: { x: 30, y: 50 },
    deliveryTime: "2-3 days",
  },
  "Chennai": {
    id: "chennai",
    name: "Chennai",
    coordinates: { x: 32, y: 70 },
    deliveryTime: "2-3 days",
  },
  "Kolkata": {
    id: "kolkata",
    name: "Kolkata",
    coordinates: { x: 45, y: 40 },
    deliveryTime: "2-3 days",
  },
  "Pune": {
    id: "pune",
    name: "Pune",
    coordinates: { x: 28, y: 58 },
    deliveryTime: "1-2 days",
  },
  "Ahmedabad": {
    id: "ahmedabad",
    name: "Ahmedabad",
    coordinates: { x: 22, y: 45 },
    deliveryTime: "2-3 days",
  },
};

export function CityMap({ onCitySelect, selectedCity, availableCities }: CityMapProps) {
  const isMobile = useIsMobile();

  const cities = availableCities
    .filter(city => CITY_INFO[city])
    .map(city => ({
      ...CITY_INFO[city],
      active: true
    }));

  return (
    <div className="relative w-full">
      <div className={`grid ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-4 gap-4'} p-4`}>
        {cities.map((city) => (
          <TooltipProvider key={city.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  onClick={() => onCitySelect(city.name)}
                  className={`
                    flex flex-col items-center justify-center p-3
                    bg-white/[0.02] backdrop-blur-sm rounded-lg
                    border ${selectedCity === city.name ? 'border-primary' : 'border-primary/20'} 
                    cursor-pointer hover:border-primary transition-colors duration-200
                    ${isMobile ? 'text-sm' : 'text-base'}
                  `}
                >
                  <MapPin className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'} ${
                    selectedCity === city.name ? 'text-primary' : 'text-primary/60'
                  } mb-2`} />
                  <span className="font-medium">{city.name}</span>
                  <span className="text-muted-foreground text-xs mt-1">
                    {city.deliveryTime}
                  </span>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delivery time: {city.deliveryTime}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
}