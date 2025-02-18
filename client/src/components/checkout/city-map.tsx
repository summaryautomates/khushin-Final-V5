import { motion } from "framer-motion";
import { MapPin, Clock, Package } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const cities = [
  {
    id: "mumbai",
    name: "Mumbai",
    coordinates: { x: 30, y: 60 },
    deliveryTime: "1-2 days",
    active: true,
  },
  {
    id: "pune",
    name: "Pune",
    coordinates: { x: 35, y: 65 },
    deliveryTime: "1-2 days",
    active: true,
  },
  {
    id: "delhi",
    name: "Delhi",
    coordinates: { x: 30, y: 20 },
    deliveryTime: "2-3 days",
    active: true,
  },
  {
    id: "hyderabad",
    name: "Hyderabad",
    coordinates: { x: 35, y: 55 },
    deliveryTime: "2-3 days",
    active: true,
  },
];

interface CityMapProps {
  onCitySelect: (city: string) => void;
  selectedCity?: string;
}

export function CityMap({ onCitySelect, selectedCity }: CityMapProps) {
  return (
    <div className="relative w-full aspect-[4/3] bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-lg overflow-hidden">
      {/* Map Background */}
      <div className="absolute inset-0 bg-[url('/india-map.svg')] bg-no-repeat bg-contain bg-center opacity-20" />

      {/* City Markers */}
      <div className="relative w-full h-full">
        <TooltipProvider>
          {cities.map((city) => (
            <motion.div
              key={city.id}
              className="absolute cursor-pointer"
              style={{
                left: `${city.coordinates.x}%`,
                top: `${city.coordinates.y}%`,
              }}
              whileHover={{ scale: 1.2 }}
              animate={{
                scale: selectedCity === city.id ? 1.2 : 1,
              }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onCitySelect(city.id)}
                    className={`group relative ${
                      selectedCity === city.id 
                        ? 'text-primary' 
                        : 'text-white/70 hover:text-primary/80'
                    }`}
                  >
                    <MapPin className="w-6 h-6" />
                    
                    {/* Selection Ring */}
                    {selectedCity === city.id && (
                      <motion.div
                        className="absolute -inset-2 rounded-full border-2 border-current"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.3 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                    
                    {/* Hover Ring */}
                    <motion.div
                      className="absolute -inset-4 rounded-full bg-current"
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileHover={{ scale: 1, opacity: 0.1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="flex items-center gap-2">
                  <div>
                    <p className="font-medium">{city.name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{city.deliveryTime}</span>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          ))}
        </TooltipProvider>
      </div>

      {/* Legend */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center justify-center gap-4 text-xs text-white/70">
          <div className="flex items-center gap-1">
            <Package className="w-4 h-4" />
            <span>Express Delivery Available</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>Estimated Delivery Time</span>
          </div>
        </div>
      </div>
    </div>
  );
}
