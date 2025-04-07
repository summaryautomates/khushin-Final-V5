import React, { useState, useEffect, useRef, Suspense } from "react";
import { motion } from "framer-motion";
import { Scene3D, InteractiveProduct3D } from "./Scene3D";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, Sparkles, Package, Monitor, RotateCcw, AlertTriangle } from "lucide-react";
import { LuxuryButton } from "@/components/ui/luxury-button";

// Define types for our models
export type ShowroomModel = {
  id: string;
  name: string;
  description: string;
  features: string[];
  modelPath: string;
  thumbnailImage: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
};

interface VirtualShowroomProps {
  models: ShowroomModel[];
  title?: string;
  description?: string;
}

// Error boundary component for 3D rendering
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Error in 3D model rendering:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center h-full w-full">
          <div className="text-center p-8">
            <AlertTriangle className="h-10 w-10 text-primary/70 mb-2 mx-auto" />
            <h3 className="text-xl font-light mb-2">3D Experience Loading</h3>
            <p className="text-zinc-400 text-sm">Our luxury interactive showcase is preparing...</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function VirtualShowroom({ models, title, description }: VirtualShowroomProps) {
  const [selectedModel, setSelectedModel] = useState<ShowroomModel | null>(models.length > 0 ? models[0] : null);
  const [activeTab, setActiveTab] = useState("features");
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFadingIn, setIsFadingIn] = useState(false);

  // Check viewport size on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle model selection
  const handleModelSelect = (model: ShowroomModel) => {
    setIsFadingIn(true);
    setTimeout(() => {
      setSelectedModel(model);
      setIsFadingIn(false);
    }, 300); // Match this timing with the CSS transition
  };

  return (
    <div ref={containerRef} className="container mx-auto px-4">
      {/* Section heading */}
      <div className="text-center mb-16">
        {title && (
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-extralight tracking-wider uppercase mb-4"
          >
            <span className="bg-gradient-to-r from-primary/80 via-white to-primary/80 bg-clip-text text-transparent pb-2">
              {title}
            </span>
          </motion.h2>
        )}
        
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-zinc-400 max-w-xl mx-auto mb-8"
          >
            {description}
          </motion.p>
        )}
        
        <div className="h-[1px] w-40 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"></div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-16">
        {/* 3D viewer */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="lg:col-span-3 relative min-h-[400px] md:min-h-[500px] bg-gradient-to-b from-transparent to-black/20 rounded-lg overflow-hidden border border-zinc-800 hover:border-primary/20 transition-all duration-500"
        >
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-10 h-10 z-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-[30%] h-[1px] bg-primary"></div>
            <div className="absolute top-0 left-0 h-[30%] w-[1px] bg-primary"></div>
          </div>
          
          <div className="absolute bottom-0 right-0 w-10 h-10 z-10 pointer-events-none">
            <div className="absolute bottom-0 right-0 w-[30%] h-[1px] bg-primary"></div>
            <div className="absolute bottom-0 right-0 h-[30%] w-[1px] bg-primary"></div>
          </div>
          
          {/* Rotate instruction overlay */}
          <div className="absolute bottom-4 right-4 z-10 bg-black/70 backdrop-blur-sm p-2 rounded-full border border-zinc-800 flex items-center gap-2 text-xs text-zinc-400">
            <RotateCcw className="h-3 w-3 text-primary" />
            <span>Drag to rotate</span>
          </div>

          {/* Camera controls instruction */}
          <div className="absolute bottom-4 left-4 z-10 bg-black/70 backdrop-blur-sm p-2 rounded-full border border-zinc-800 flex items-center gap-2 text-xs text-zinc-400">
            <span>Scroll to zoom</span>
          </div>
          
          {/* 3D Scene with error handling */}
          <div className={`w-full h-full transition-opacity duration-300 ${isFadingIn ? 'opacity-0' : 'opacity-100'}`}>
            {selectedModel && (
              <ErrorBoundary fallback={
                <div className="flex flex-col items-center justify-center h-full w-full p-8 text-center">
                  <AlertTriangle className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-light mb-2">Experience Loading</h3>
                  <p className="text-zinc-400">Our luxury 3D experience is being prepared</p>
                </div>
              }>
                <Suspense fallback={
                  <div className="flex flex-col items-center justify-center h-full w-full">
                    <div className="text-center p-8">
                      <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-zinc-400">Loading luxury experience...</p>
                    </div>
                  </div>
                }>
                  <Scene3D className="w-full h-full">
                    {/* The InteractiveProduct3D component takes the model path and renders it */}
                    <InteractiveProduct3D
                      path={selectedModel.modelPath}
                      scale={selectedModel.scale || 1}
                      position={selectedModel.position || [0, 0, 0]}
                      rotation={selectedModel.rotation || [0, 0, 0]}
                    />
                  </Scene3D>
                </Suspense>
              </ErrorBoundary>
            )}
          </div>
        </motion.div>

        {/* Product info panel */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="lg:col-span-2 flex flex-col gap-6"
        >
          {selectedModel && (
            <>
              <div className="backdrop-blur-sm bg-black/30 p-6 rounded-none border border-zinc-800 hover:border-primary/20 transition-all duration-500 overflow-hidden">
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-10 h-10 pointer-events-none">
                  <div className="absolute top-0 left-0 w-[30%] h-[1px] bg-primary"></div>
                  <div className="absolute top-0 left-0 h-[30%] w-[1px] bg-primary"></div>
                </div>
                
                <div className="absolute bottom-0 right-0 w-10 h-10 pointer-events-none">
                  <div className="absolute bottom-0 right-0 w-[30%] h-[1px] bg-primary"></div>
                  <div className="absolute bottom-0 right-0 h-[30%] w-[1px] bg-primary"></div>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-light tracking-wide mb-4">
                  {selectedModel.name}
                </h2>
                
                <p className="text-zinc-400 mb-6">
                  {selectedModel.description}
                </p>
                
                <Tabs
                  defaultValue="features"
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 bg-black/50 border border-white/10">
                    <TabsTrigger 
                      value="features" 
                      className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:shadow-none data-[state=active]:text-primary"
                    >
                      <Sparkles className="h-4 w-4" />
                      Features
                    </TabsTrigger>
                    <TabsTrigger 
                      value="details" 
                      className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:shadow-none data-[state=active]:text-primary"
                    >
                      <Info className="h-4 w-4" />
                      Details
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="features" className="mt-4 min-h-[200px] bg-black/10 backdrop-blur-sm p-4 border border-zinc-900">
                    <ul className="space-y-3">
                      {selectedModel.features.map((feature, index) => (
                        <motion.li 
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-start gap-3 text-zinc-300"
                        >
                          <span className="text-primary mt-1">•</span>
                          <span>{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </TabsContent>
                  
                  <TabsContent value="details" className="mt-4 min-h-[200px] bg-black/10 backdrop-blur-sm p-4 border border-zinc-900">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-primary" />
                        <div>
                          <h4 className="text-sm font-medium">Premium Packaging</h4>
                          <p className="text-xs text-zinc-400">Arrives in an elegant gift box with certificate of authenticity</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Monitor className="h-5 w-5 text-primary" />
                        <div>
                          <h4 className="text-sm font-medium">360° Viewing</h4>
                          <p className="text-xs text-zinc-400">Explore every detail with our interactive 3D viewer</p>
                        </div>
                      </div>
                      
                      <div className="h-[1px] w-full bg-zinc-800/50"></div>
                      
                      <div className="text-center">
                        <LuxuryButton>Add to Cart</LuxuryButton>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Product selection carousel */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        viewport={{ once: true }}
      >
        <h3 className="text-xl font-light tracking-wide mb-6 text-center">
          <span className="bg-gradient-to-r from-white via-primary/80 to-white bg-clip-text text-transparent">
            Explore the Collection
          </span>
        </h3>
        
        <Carousel className="w-full max-w-5xl mx-auto">
          <CarouselContent>
            {models.map((model) => (
              <CarouselItem key={model.id} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
                <Card 
                  className={`bg-black/40 border-zinc-800 overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 cursor-pointer ${
                    selectedModel?.id === model.id ? 'border-primary/50 shadow-sm shadow-primary/10' : ''
                  }`}
                  onClick={() => handleModelSelect(model)}
                >
                  <CardContent className="p-0 relative">
                    <div className="h-32 overflow-hidden">
                      <img 
                        src={model.thumbnailImage} 
                        alt={model.name} 
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                    </div>
                    <div className="p-3 text-center">
                      <h4 className="text-sm font-medium truncate">
                        {model.name.split(" - ")[0]}
                      </h4>
                    </div>
                    {selectedModel?.id === model.id && (
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-primary"></div>
                    )}
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-1 bg-black/80 border-zinc-700 text-white hover:bg-black/90" />
          <CarouselNext className="right-1 bg-black/80 border-zinc-700 text-white hover:bg-black/90" />
        </Carousel>
      </motion.div>
    </div>
  );
}