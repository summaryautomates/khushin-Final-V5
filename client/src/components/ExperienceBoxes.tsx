import { Link } from "wouter";
import { Clock, Gift, ArrowRight } from "lucide-react";
import { LuxuryButton } from "@/components/ui/luxury-button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";

// Luxury card effect with gold accents
function LuxuryCard({ 
  children, 
  className, 
  isHovered,
  onHover
}: { 
  children: React.ReactNode; 
  className?: string;
  isHovered: boolean;
  onHover: (isHovered: boolean) => void;
}) {
  return (
    <motion.div 
      className={cn(
        "luxury-card relative p-10 md:p-12 lg:p-16 border border-zinc-800",
        "group transition-all duration-500 ease-in-out h-full",
        className
      )}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      onHoverStart={() => onHover(true)}
      onHoverEnd={() => onHover(false)}
    >
      {/* Gold accent line at top */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
      
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[url('/images/dark-texture.svg')] opacity-10 mix-blend-overlay" />
      
      {/* Gold corner accents */}
      <div className="luxury-accent luxury-accent-top-left" />
      <div className="luxury-accent luxury-accent-left" />
      <div className="luxury-accent luxury-accent-bottom-right" />
      <div className="luxury-accent luxury-accent-right" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

export function ExperienceBoxes() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  
  return (
    <div className="relative container mx-auto px-4 py-8 overflow-hidden lg:max-w-7xl xl:max-w-[1400px]">
      {/* Section Heading with gold underline */}
      <div className="text-center mb-8 lg:mb-10">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-wider uppercase mb-3 lg:mb-4">Exclusive Experiences</h2>
        <div className="h-[1px] w-24 md:w-32 lg:w-40 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 xl:gap-24 max-w-6xl mx-auto">
        {/* Book Experience Box */}
        <LuxuryCard 
          isHovered={hoveredCard === 0}
          onHover={(isHovered) => setHoveredCard(isHovered ? 0 : null)}
          className={cn(
            "flex flex-col items-center space-y-6 text-center transition-all duration-500",
            hoveredCard === 0 ? "transform-gpu -translate-y-2 shadow-xl shadow-primary/5" : ""
          )}
        >
          <div className="relative">
            <Clock className={cn(
              "luxury-icon w-16 h-16",
              hoveredCard === 0 ? "text-primary" : "text-white"
            )} />
            {hoveredCard === 0 && (
              <motion.div 
                className="luxury-icon-glow"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </div>
          
          <h2 className={cn(
            "luxury-title",
            hoveredCard === 0 ? "text-primary" : "text-white"
          )}>
            Book Experience
          </h2>
          
          <p className="luxury-description max-w-sm">
            Schedule premium styling sessions with our expert consultants for a personalized luxury experience
          </p>
          
          <div className="pt-4">
            <Link href="/event-organizer">
              <LuxuryButton 
                variant="outline" 
                size="lg"
                iconRight={<ArrowRight className="w-4 h-4" />}
                className="mt-4"
              >
                Book Now
              </LuxuryButton>
            </Link>
          </div>
        </LuxuryCard>

        {/* Loyalty Program Box */}
        <LuxuryCard 
          isHovered={hoveredCard === 1}
          onHover={(isHovered) => setHoveredCard(isHovered ? 1 : null)}
          className={cn(
            "flex flex-col items-center space-y-6 text-center transition-all duration-500",
            hoveredCard === 1 ? "transform-gpu -translate-y-2 shadow-xl shadow-primary/5" : ""
          )}
        >
          <div className="relative">
            <Gift className={cn(
              "luxury-icon w-16 h-16",
              hoveredCard === 1 ? "text-primary" : "text-white"
            )} />
            {hoveredCard === 1 && (
              <motion.div 
                className="luxury-icon-glow"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </div>
          
          <h2 className={cn(
            "luxury-title",
            hoveredCard === 1 ? "text-primary" : "text-white"
          )}>
            Loyalty Program
          </h2>
          
          <p className="luxury-description max-w-sm">
            Join our exclusive rewards program and earn points on every purchase for special discounts
          </p>
          
          <div className="pt-4">
            <Link href="/loyalty">
              <LuxuryButton 
                variant="outline" 
                size="lg"
                iconRight={<ArrowRight className="w-4 h-4" />}
                className="mt-4"
              >
                Join Program
              </LuxuryButton>
            </Link>
          </div>
        </LuxuryCard>
      </div>
    </div>
  );
}
