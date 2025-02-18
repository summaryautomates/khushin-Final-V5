import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { useState } from "react";

const cities = [
  { id: "mumbai", name: "Mumbai", coordinates: { x: 30, y: 60 } },
  { id: "pune", name: "Pune", coordinates: { x: 25, y: 65 } },
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
    <div className="relative w-full aspect-[4/3] bg-zinc-950 rounded-lg overflow-hidden">
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
              scale: hoveredCity === city.id || selectedCity === city.id ? 1.2 : 1
            }}
          >
            <div
              className={`group relative ${
                selectedCity === city.id ? 'text-primary' : 'text-white'
              }`}
              onMouseEnter={() => setHoveredCity(city.id)}
              onMouseLeave={() => setHoveredCity(null)}
              onClick={() => onCitySelect(city.id)}
            >
              <MapPin className="w-6 h-6" />
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black/80 text-white text-xs px-2 py-1 rounded">
                {city.name}
              </div>
              {(hoveredCity === city.id || selectedCity === city.id) && (
                <motion.div
                  className="absolute -inset-2 rounded-full border border-current opacity-50"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.5 }}
                />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}