import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { useState } from "react";

const cities = [
  { id: "mumbai", name: "Mumbai", coordinates: { x: 30, y: 60 } },
  { id: "pune", name: "Pune", coordinates: { x: 35, y: 65 } },
  { id: "delhi", name: "Delhi", coordinates: { x: 30, y: 20 } },
  { id: "hyderabad", name: "Hyderabad", coordinates: { x: 35, y: 55 } },
];

interface CitySelectorProps {
  onCitySelect: (city: string) => void;
  selectedCity?: string;
}

export function CitySelector({ onCitySelect, selectedCity }: CitySelectorProps) {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  return (
    <div className="relative w-full aspect-[4/3] bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-lg overflow-hidden">
      <div className="absolute inset-0 bg-[url('/india-map.svg')] bg-no-repeat bg-contain bg-center opacity-20" />

      <div className="relative w-full h-full">
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
              scale: hoveredCity === city.id || selectedCity === city.id ? 1.2 : 1,
            }}
          >
            <div
              className={`group relative ${
                selectedCity === city.id 
                  ? 'text-primary' 
                  : hoveredCity === city.id 
                  ? 'text-primary/80' 
                  : 'text-white/70'
              }`}
              onMouseEnter={() => setHoveredCity(city.id)}
              onMouseLeave={() => setHoveredCity(null)}
              onClick={() => onCitySelect(city.id)}
            >
              <MapPin className="w-6 h-6" />
              <div 
                className={`absolute left-1/2 -translate-x-1/2 -bottom-1 
                  ${hoveredCity === city.id || selectedCity === city.id 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-1'} 
                  transition-all duration-200 whitespace-nowrap 
                  bg-black/80 text-white text-xs px-2 py-1 rounded`}
              >
                {city.name}
              </div>
              {(hoveredCity === city.id || selectedCity === city.id) && (
                <motion.div
                  className="absolute -inset-4 rounded-full border-2 border-current"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.3 }}
                  transition={{ duration: 0.3 }}
                />
              )}
              <motion.div
                className="absolute -inset-8 rounded-full bg-current"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: hoveredCity === city.id || selectedCity === city.id ? 1 : 0.8,
                  opacity: hoveredCity === city.id || selectedCity === city.id ? 0.1 : 0
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
        <p className="text-xs text-center text-white/70">
          Select your delivery city for accurate shipping estimates
        </p>
      </div>
    </div>
  );
}