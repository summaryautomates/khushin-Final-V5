import { motion } from "framer-motion";
import { MapPin, Clock, Package } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
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
    coordinates: { x: 25, y: 55 },
    deliveryTime: "1-2 days",
    active: true,
  },
  {
    id: "pune",
    name: "Pune",
    coordinates: { x: 28, y: 58 },
    deliveryTime: "1-2 days",
    active: true,
  },
  {
    id: "delhi",
    name: "Delhi",
    coordinates: { x: 28, y: 25 },
    deliveryTime: "2-3 days",
    active: true,
  },
  {
    id: "hyderabad",
    name: "Hyderabad",
    coordinates: { x: 30, y: 50 },
    deliveryTime: "2-3 days",
    active: true,
  },
];

export function CityMap() {
  const isMobile = useIsMobile();

  return (
    <div className="relative w-full">
      <div className={`grid ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-4 gap-4'} p-4`}>
        {cities.map((city) => (
          <TooltipProvider key={city.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`
                    flex flex-col items-center justify-center p-3
                    bg-white/[0.02] backdrop-blur-sm rounded-lg
                    border border-primary/20 cursor-pointer
                    ${isMobile ? 'text-sm' : 'text-base'}
                  `}
                >
                  <MapPin className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'} text-primary mb-2`} />
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