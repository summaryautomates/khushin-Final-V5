import { motion, useMotionValue, useTransform } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LuxuryButton } from "@/components/ui/luxury-button";
import { LuxuryInstructionCard } from "@/components/LuxuryInstructionCard";
import { useState, useEffect, useRef } from "react";
import {
  Droplet,
  Zap,
  Shield,
  Settings,
  ChevronRight,
  Clock,
  MapPin,
  CreditCard,
  AlertTriangle,
  Flame,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Smartphone,
  Hand,
  Pointer,
} from "lucide-react";

// Mobile-friendly touch swipe component for detailed instructions
const TouchSwipeCards = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardWidth = useRef(0);
  const [showTouchHint, setShowTouchHint] = useState(true);

  useEffect(() => {
    if (containerRef.current) {
      cardWidth.current = containerRef.current.clientWidth;
    }
    
    // Hide touch hint after 3 seconds
    const timer = setTimeout(() => {
      setShowTouchHint(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleDragEnd = (event: any, info: any) => {
    if (Math.abs(info.offset.x) > cardWidth.current * 0.4) {
      if (info.offset.x > 0 && currentIndex > 0) {
        // Swiped right
        setCurrentIndex(currentIndex - 1);
        // Add vibration for haptic feedback if supported
        if (window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(50);
        }
      } else if (info.offset.x < 0 && currentIndex < images.length - 1) {
        // Swiped left
        setCurrentIndex(currentIndex + 1);
        // Add vibration for haptic feedback if supported
        if (window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(50);
        }
      }
    }
    x.set(0);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    // Add vibration for haptic feedback if supported
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(20);
    }
  };

  return (
    <div className="relative w-full overflow-hidden">
      {/* Touch hint indicator (mobile only) */}
      {showTouchHint && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 
                      flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 rounded-lg
                      border border-primary/50 md:hidden animate-pulse">
          <Pointer className="w-6 h-6 text-primary mr-2" />
          <span className="text-sm text-zinc-200">Swipe to view all</span>
        </div>
      )}
      
      <motion.div
        ref={containerRef}
        className="relative overflow-hidden w-full touch-pan-y"
        style={{ height: "250px" }}
      >
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          style={{ x }}
          className="absolute inset-0 flex items-center"
        >
          {images.map((image, idx) => (
            <motion.div
              key={idx}
              className={`min-w-full flex items-center justify-center transition-opacity duration-300 ${
                idx === currentIndex ? "opacity-100" : "opacity-0"
              }`}
              style={{
                transform: `translateX(${(idx - currentIndex) * 100}%)`,
              }}
            >
              <div className="relative p-[1px] bg-gradient-to-br from-primary/30 via-primary/80 to-primary/30 overflow-hidden max-w-[90%] mx-auto">
                <img 
                  src={image} 
                  alt={`Refueling instruction ${idx + 1}`}
                  className="max-h-[240px] w-auto object-contain bg-black/90"
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
      
      {/* Custom pagination indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`w-2 h-2 rounded-full transition-all duration-300 
                      ${idx === currentIndex 
                        ? "bg-primary w-4" 
                        : "bg-zinc-600 hover:bg-primary/50"}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
      
      {/* Navigation buttons (more visible on mobile) */}
      <div className="flex justify-between absolute top-1/2 left-0 right-0 transform -translate-y-1/2 px-2 pointer-events-none">
        {currentIndex > 0 && (
          <button
            onClick={() => goToSlide(currentIndex - 1)}
            className="h-10 w-10 rounded-full bg-black/50 backdrop-blur-sm border border-primary/30 
                     flex items-center justify-center pointer-events-auto
                     text-primary/80 hover:text-primary transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {currentIndex < images.length - 1 && (
          <button
            onClick={() => goToSlide(currentIndex + 1)}
            className="h-10 w-10 rounded-full bg-black/50 backdrop-blur-sm border border-primary/30 
                     flex items-center justify-center ml-auto pointer-events-auto
                     text-primary/80 hover:text-primary transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

// Mobile-optimized tap feature card
const MobileTapFeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => {
  const [tapped, setTapped] = useState(false);
  
  const handleTap = () => {
    setTapped(!tapped);
    // Add haptic feedback
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(30);
    }
  };
  
  return (
    <motion.div 
      className={`relative bg-black/50 backdrop-blur-sm border p-5 
                ${tapped ? 'border-primary/50 shadow-lg shadow-primary/5' : 'border-zinc-800'}`}
      onClick={handleTap}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-10 h-10 pointer-events-none">
        <div 
          className={`absolute top-0 left-0 h-[1px] bg-primary transition-all duration-300`}
          style={{ width: tapped ? '100%' : '30%' }} 
        />
        <div 
          className={`absolute top-0 left-0 w-[1px] bg-primary transition-all duration-300`}
          style={{ height: tapped ? '100%' : '30%' }} 
        />
      </div>
      
      <div className="absolute bottom-0 right-0 w-10 h-10 pointer-events-none">
        <div 
          className={`absolute bottom-0 right-0 h-[1px] bg-primary transition-all duration-300`}
          style={{ width: tapped ? '100%' : '30%' }} 
        />
        <div 
          className={`absolute bottom-0 right-0 w-[1px] bg-primary transition-all duration-300`}
          style={{ height: tapped ? '100%' : '30%' }} 
        />
      </div>
      
      <div className="flex items-start">
        <div className={`relative min-w-[50px] h-[50px] rounded-full flex items-center justify-center 
                       bg-black/40 border transition-all duration-300 mr-4
                       ${tapped ? 'border-primary/50 bg-black/70' : 'border-zinc-800'}`}>
          <Icon className={`w-6 h-6 transition-all duration-300 ${tapped ? 'text-primary' : 'text-zinc-400'}`} />
          {tapped && (
            <motion.div 
              className="absolute -inset-1 rounded-full bg-primary/5 blur-lg" 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </div>
        
        <div>
          <h3 className={`font-light tracking-wide uppercase mb-2 transition-colors duration-300 
                        ${tapped ? 'text-primary' : 'text-white'}`}>
            {title}
          </h3>
          
          <p className={`text-sm transition-colors duration-300 
                       ${tapped ? 'text-zinc-300' : 'text-zinc-500'}`}>
            {description}
          </p>
        </div>
        
        <div className={`ml-auto transform transition-all duration-300 
                       ${tapped ? 'opacity-100 translate-x-0 rotate-90' : 'opacity-0 translate-x-2'}`}>
          <ChevronUp className="w-5 h-5 text-primary" />
        </div>
      </div>
      
      {tapped && (
        <motion.div 
          className="mt-4 pt-4 border-t border-zinc-800"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-zinc-300 text-sm">
            {title === "Premium Butane" && "Our premium butane is triple-refined to ensure the highest purity, providing cleaner burns and protecting your luxury lighter's valve system from impurities."}
            {title === "Quick Refill" && "The specially designed nozzle adapter ensures precise connection with your lighter's valve, resulting in efficient and mess-free refueling in under 10 seconds."}
            {title === "Safety First" && "Each refill canister is equipped with multiple safety mechanisms including pressure-release valves and child-resistant features to ensure safe handling."}
            {title === "Maintenance" && "The complete maintenance kit includes specialized tools for valve cleaning, flint replacement, and proper ignition adjustment to extend your lighter's lifespan."}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

const Refueling = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="min-h-[70vh] flex items-center justify-center bg-black relative overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <motion.div
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.85 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="h-full w-full"
          >
            <img
              src="/RS.png"
              className="w-full h-full object-cover object-center"
              alt="Luxury refueling background"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/90"></div>
          </motion.div>
        </div>

        <div className="container relative z-10 px-4 py-6 max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center gap-5 mt-[-60px]">
            {/* Appointment Button */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <a
                href="https://khushi.setmore.com/saransh"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/images/appointment-booking-badge.png"
                  alt="Appointment Booking Since 2000"
                  className="w-auto max-h-40 mx-auto hover:opacity-90 transition-opacity"
                  style={{
                    filter: "drop-shadow(0 0 20px rgba(255, 255, 0, 0.4))",
                  }}
                />
                <div className="flex gap-4 justify-center mt-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7 text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7 text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                </div>
              </a>
            </motion.div>

            {/* Main Heading with elegant divider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="relative"
            >
              <div className="absolute left-0 right-0 h-[1px] top-1/2 transform -translate-y-1/2 z-0">
                <div className="h-full w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
              </div>
              
              <motion.h1
                initial={{ letterSpacing: "0.2em", opacity: 0, y: -20 }}
                animate={{ letterSpacing: "0.1em", opacity: 1, y: 0 }}
                transition={{ duration: 1.5, delay: 0.7, ease: "easeOut" }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extralight tracking-wider text-center relative z-10"
              >
                <span className="bg-black px-6 py-2">
                  <span className="bg-gradient-to-r from-white via-primary/90 to-white bg-clip-text text-transparent pb-2">
                    Refueling Solutions
                  </span>
                </span>
              </motion.h1>
            </motion.div>
            
            {/* Luxury ornament */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="flex justify-center my-5"
            >
              <div className="flex items-center gap-3">
                <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-primary/80"></div>
                <Droplet className="w-5 h-5 text-primary" />
                <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-primary/80"></div>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 1, ease: "easeOut" }}
              className="backdrop-blur-sm bg-black/30 p-6 sm:p-8 rounded-none border border-zinc-800 hover:border-primary/20 transition-all duration-500 max-w-3xl relative overflow-hidden group"
            >
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-10 h-10 pointer-events-none">
                <div className="absolute top-0 left-0 w-[30%] h-[1px] bg-primary transform origin-left transition-all duration-700 group-hover:w-full"></div>
                <div className="absolute top-0 left-0 h-[30%] w-[1px] bg-primary transform origin-top transition-all duration-700 group-hover:h-full"></div>
              </div>
              
              <div className="absolute bottom-0 right-0 w-10 h-10 pointer-events-none">
                <div className="absolute bottom-0 right-0 w-[30%] h-[1px] bg-primary transform origin-right transition-all duration-700 group-hover:w-full"></div>
                <div className="absolute bottom-0 right-0 h-[30%] w-[1px] bg-primary transform origin-bottom transition-all duration-700 group-hover:h-full"></div>
              </div>
              
              <motion.p className="text-lg md:text-xl text-white text-center leading-relaxed relative z-10">
                Experience the perfect blend of convenience and reliability with
                our premium refueling solutions. Each refill is carefully
                engineered to maintain the integrity of your luxury lighter.
              </motion.p>
              
              {/* Subtle glow on hover */}
              <div className="absolute inset-0 opacity-0 bg-primary/3 blur-xl transition-opacity duration-1000 group-hover:opacity-100"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid and Guide Section */}
      <section className="py-28 bg-gradient-to-b from-zinc-950 to-black">
        <div className="container px-4">
          {/* Section Title */}
          <div className="text-center mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-extralight tracking-wider uppercase mb-4"
            >
              <span className="bg-gradient-to-r from-primary/80 via-white to-primary/80 bg-clip-text text-transparent pb-2">
                Premium Features
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-zinc-400 max-w-xl mx-auto"
            >
              Our refueling solutions are designed with luxury and performance in mind.
            </motion.p>
            <div className="h-[1px] w-40 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-8"></div>
          </div>
          
          {/* Feature grid - desktop version with hover, mobile version with tap */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
            {[
              {
                icon: Droplet,
                title: "Premium Butane",
                description:
                  "Ultra-refined butane fuel specially formulated for luxury lighters.",
              },
              {
                icon: Zap,
                title: "Quick Refill",
                description:
                  "Efficient refilling system designed for ease and speed.",
              },
              {
                icon: Shield,
                title: "Safety First",
                description:
                  "Built-in safety mechanisms for secure and controlled refilling.",
              },
              {
                icon: Settings,
                title: "Maintenance",
                description:
                  "Complete maintenance kit for optimal lighter performance.",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true, margin: "-50px" }}
                className="group h-full"
              >
                {isMobile ? (
                  <MobileTapFeatureCard 
                    icon={feature.icon} 
                    title={feature.title} 
                    description={feature.description}
                  />
                ) : (
                  <div className="relative h-full bg-black/50 backdrop-blur-sm border border-zinc-800 p-6 overflow-hidden transition-all duration-500 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                    {/* Gold accent corner lines */}
                    <div className="absolute top-0 left-0 w-10 h-10 pointer-events-none">
                      <div className="absolute top-0 left-0 w-[30%] h-[1px] bg-primary transform origin-left transition-all duration-500 group-hover:w-full"></div>
                      <div className="absolute top-0 left-0 h-[30%] w-[1px] bg-primary transform origin-top transition-all duration-500 group-hover:h-full"></div>
                    </div>
                    
                    <div className="absolute bottom-0 right-0 w-10 h-10 pointer-events-none">
                      <div className="absolute bottom-0 right-0 w-[30%] h-[1px] bg-primary transform origin-right transition-all duration-500 group-hover:w-full"></div>
                      <div className="absolute bottom-0 right-0 h-[30%] w-[1px] bg-primary transform origin-bottom transition-all duration-500 group-hover:h-full"></div>
                    </div>
                    
                    {/* Icon with glow effect */}
                    <div className="relative mb-6 w-14 h-14 rounded-full flex items-center justify-center bg-black/40 border border-zinc-800 transition-all duration-500 group-hover:border-primary/30 group-hover:bg-black/60">
                      <feature.icon className="w-7 h-7 text-primary transition-all duration-500" />
                      
                      <div className="absolute -inset-1 rounded-full opacity-0 bg-primary/5 blur-xl transition-opacity duration-500 group-hover:opacity-100"></div>
                    </div>
                    
                    {/* Title and description */}
                    <h3 className="text-xl font-light tracking-wide uppercase mb-3 transition-colors duration-300 group-hover:text-primary">
                      {feature.title}
                    </h3>
                    
                    <p className="text-zinc-400 leading-relaxed transition-colors duration-300 group-hover:text-zinc-300">
                      {feature.description}
                    </p>
                    
                    {/* Subtle animated arrow that appears on hover */}
                    <div className="absolute bottom-6 right-6 opacity-0 transform translate-x-2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0">
                      <ChevronRight className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Refueling Information Section */}
      <section className="py-28 bg-gradient-to-b from-black to-black/95">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-5xl mx-auto"
          >
            {/* Luxury Shop Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="flex justify-center mb-16 relative"
            >
              <div className="relative group cursor-pointer"
                onClick={() => {
                  window.open("/RII.png", "_blank", "noopener,noreferrer");
                }}
              >
                {/* Animated gold frame */}
                <div className="absolute -inset-1 rounded-sm opacity-0 bg-primary/10 blur-md transition-opacity duration-500 group-hover:opacity-100"></div>
                
                {/* Ornament top */}
                <div className="flex justify-center mb-4">
                  <div className="h-[1px] w-16 bg-gradient-to-r from-primary/20 via-primary/60 to-primary/20"></div>
                </div>
                
                {/* Main image with gold border */}
                <div className="relative p-[1px] bg-gradient-to-br from-primary/30 via-primary/80 to-primary/30 overflow-hidden">
                  <img
                    src="/RI.png"
                    alt="Shop Refueling Accessories"
                    className="h-28 w-auto object-contain bg-black/90 group-hover:scale-105 transition-transform duration-700"
                  />
                  
                  {/* Animated gold shimmer effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-20 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                  </div>
                </div>
                
                {/* Ornament bottom */}
                <div className="flex justify-center mt-4">
                  <div className="flex items-center gap-2">
                    <div className="h-[1px] w-3 bg-primary/60"></div>
                    <div className="h-[1px] w-16 bg-gradient-to-r from-primary/20 via-primary/60 to-primary/20"></div>
                    <div className="h-[1px] w-3 bg-primary/60"></div>
                  </div>
                </div>
                
                {/* Shop text */}
                <div className="absolute -bottom-8 left-0 right-0 text-center">
                  <span className="text-xs uppercase tracking-[0.2em] text-primary/80 group-hover:text-primary transition-colors duration-300">
                    Shop Now
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Section Title */}
            <div className="text-center mb-16">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-3xl font-light tracking-wider uppercase mb-4"
              >
                Refueling Guide
              </motion.h2>
              <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"></div>
            </div>

            {/* Mobile swipe instructions */}
            {isMobile && (
              <div className="mb-12">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-light uppercase tracking-wider text-primary/90 mb-2">
                    Interactive Instruction Guide
                  </h3>
                  <div className="flex items-center justify-center gap-2">
                    <ChevronLeft className="w-4 h-4 text-primary/70" />
                    <p className="text-sm text-zinc-400 swipe-hint">Swipe left and right to view all steps</p>
                    <ChevronRight className="w-4 h-4 text-primary/70" />
                  </div>
                </div>
                
                <TouchSwipeCards
                  images={[
                    "/RII.png", 
                    "/RI.png", 
                    "/RS.png", 
                    "/RII.png", 
                    "/RI.png"
                  ]}
                />
                
                <div className="flex items-center justify-center mt-8 gap-2">
                  <Smartphone className="w-5 h-5 text-primary/70" />
                  <span className="text-xs text-zinc-400">Mobile-optimized interactive guide</span>
                </div>
              </div>
            )}
            
            {/* Desktop cards */}
            <div className={`grid gap-10 grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto ${isMobile ? 'mt-8' : ''}`}>
              {/* Luxury Refueling Steps Card */}
              <LuxuryInstructionCard
                title="Refueling Steps"
                icon={Settings}
                items={[
                  "Turn the lighter upside down",
                  "Locate the refill valve at the bottom",
                  "Press the fuel canister nozzle firmly into the valve",
                  "Hold for 5-10 seconds until full",
                  "Wait 2 minutes before use",
                ]}
                indexType="number"
                className="h-full"
              />

              {/* Luxury Safety Precautions Card */}
              <LuxuryInstructionCard
                title="Safety Precautions"
                icon={AlertTriangle}
                itemIcon={Flame}
                items={[
                  "Refill in a well-ventilated area",
                  "Keep away from open flames",
                  "Use only premium butane fuel",
                  "Don't overfill",
                  "Allow gas to stabilize before use",
                ]}
                indexType="icon"
                className="h-full"
              />
            </div>
            
            {/* Mobile floating action button for detailed instructions */}
            {isMobile ? (
              <motion.div 
                className="fixed bottom-6 right-6 z-20"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <button
                  onClick={() => {
                    window.open("/RII.png", "_blank", "noopener,noreferrer");
                    // Add haptic feedback
                    if (window.navigator && window.navigator.vibrate) {
                      window.navigator.vibrate(50);
                    }
                  }}
                  className="h-14 w-14 rounded-full bg-primary text-black shadow-lg shadow-primary/20 flex items-center justify-center action-button-pulse touch-target"
                >
                  <Settings className="w-6 h-6" />
                </button>
                <span className="absolute -top-8 right-0 whitespace-nowrap text-xs bg-black/80 text-primary px-3 py-1 rounded-full">
                  Detailed Guide
                </span>
              </motion.div>
            ) : (
              <div className="flex justify-center mt-16">
                <LuxuryButton
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    window.open("/RII.png", "_blank", "noopener,noreferrer");
                  }}
                >
                  View Detailed Instructions
                </LuxuryButton>
              </div>
            )}
            
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Refueling;
