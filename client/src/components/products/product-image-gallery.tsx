import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious,
  type CarouselApi
} from "@/components/ui/carousel";
import { AdaptiveImage } from "@/components/ui/adaptive-image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Search, X, ZoomIn, ZoomOut, Maximize, ArrowLeft, ArrowRight } from "lucide-react";

interface ProductImageGalleryProps {
  images: string[];
  alt: string;
  className?: string;
  showThumbnails?: boolean;
}

export function ProductImageGallery({ images, alt, className, showThumbnails = true }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      const selectedSlide = api.selectedScrollSnap();
      setCurrentIndex(selectedSlide);
      setSelectedImage(selectedSlide);
    });
  }, [api]);

  const handleZoomIn = useCallback(() => {
    if (zoomLevel < 2.5) {
      setZoomLevel(prev => prev + 0.5);
      setIsZoomed(true);
    }
  }, [zoomLevel]);

  const handleZoomOut = useCallback(() => {
    if (zoomLevel > 1) {
      setZoomLevel(prev => prev - 0.5);
      if (zoomLevel <= 1.5) {
        setIsZoomed(false);
      }
    }
  }, [zoomLevel]);

  const handleResetZoom = useCallback(() => {
    setZoomLevel(1);
    setIsZoomed(false);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setFullscreen(prev => !prev);
    if (isZoomed) {
      handleResetZoom();
    }
  }, [isZoomed, handleResetZoom]);

  const handleThumbnailClick = useCallback((index: number) => {
    setSelectedImage(index);
    if (api && typeof api.scrollTo === 'function') {
      api.scrollTo(index);
    }
  }, [api]);

  const navigateImage = useCallback((direction: 'prev' | 'next') => {
    if (api) {
      if (direction === 'prev' && typeof api.scrollPrev === 'function') {
        api.scrollPrev();
      } else if (direction === 'next' && typeof api.scrollNext === 'function') {
        api.scrollNext();
      }
    }
  }, [api]);

  // If there's only one image, render a simple image display
  if (images.length === 1) {
    return (
      <motion.div
        className={cn("relative aspect-square overflow-hidden bg-black rounded-lg shadow-md", className)}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <AdaptiveImage
          src={images[0] || ""}
          alt={alt}
          className="w-full h-full object-contain object-center transition-transform duration-500 hover:scale-105"
          containerClassName="h-full w-full"
        />
      </motion.div>
    );
  }

  return (
    <>
      <div className={cn("space-y-4", className)}>
        {/* Main carousel */}
        <div className="relative">
          <Carousel className="w-full" setApi={setApi}>
            <CarouselContent>
              {images.map((image, index) => (
                <CarouselItem key={index} className="flex justify-center">
                  <motion.div
                    className={cn(
                      "aspect-square overflow-hidden bg-black rounded-lg shadow-md relative",
                      isZoomed && currentIndex === index ? "cursor-zoom-out" : "cursor-zoom-in"
                    )}
                    whileHover={{ scale: isZoomed ? 1 : 1.02 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => isZoomed ? handleResetZoom() : handleZoomIn()}
                  >
                    <motion.div
                      animate={{
                        scale: currentIndex === index && isZoomed ? zoomLevel : 1
                      }}
                      transition={{ duration: 0.3 }}
                      className="w-full h-full"
                    >
                      <AdaptiveImage
                        src={image}
                        alt={`${alt} - Image ${index + 1}`}
                        className="w-full h-full object-contain object-center transition-duration-300"
                        containerClassName="h-full w-full"
                      />
                    </motion.div>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious 
              className="left-2 top-1/2 -translate-y-1/2 bg-black/80 hover:bg-black border-none shadow-md text-white"
              onClick={() => handleResetZoom()}
            />
            <CarouselNext 
              className="right-2 top-1/2 -translate-y-1/2 bg-black/80 hover:bg-black border-none shadow-md text-white"
              onClick={() => handleResetZoom()}
            />
          </Carousel>

          {/* Image controls */}
          <div className="absolute top-3 right-3 flex gap-2 z-10">
            <Button 
              size="icon" 
              variant="secondary" 
              className="h-8 w-8 bg-black/70 hover:bg-black border-none shadow-sm text-white"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 2.5}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button 
              size="icon" 
              variant="secondary" 
              className="h-8 w-8 bg-black/70 hover:bg-black border-none shadow-sm text-white"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button 
              size="icon" 
              variant="secondary" 
              className="h-8 w-8 bg-black/70 hover:bg-black border-none shadow-sm text-white"
              onClick={toggleFullscreen}
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>

          {/* Image counter */}
          <div className="absolute bottom-3 left-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs font-medium">
            {currentIndex + 1} / {images.length}
          </div>
        </div>

        {/* Improved Thumbnail strip - conditionally rendered */}
        {showThumbnails && (
          <div className="flex justify-center">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar max-w-full px-2 pb-1">
              {images.map((image, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex-shrink-0 w-16 h-16 cursor-pointer rounded-md overflow-hidden transition-all duration-300 relative",
                    selectedImage === index 
                      ? "ring-2 ring-primary shadow-md" 
                      : "ring-1 ring-gray-200 hover:ring-primary/50"
                  )}
                  onClick={() => handleThumbnailClick(index)}
                >
                  <AdaptiveImage
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    containerClassName="h-full w-full"
                  />
                  {selectedImage === index && (
                    <div className="absolute inset-0 bg-primary/10" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}
        
        {/* Hidden thumbnails container for navigation when thumbnails are not visible */}
        {!showThumbnails && images.length > 1 && (
          <div className="hidden">
            {images.map((_, index) => (
              <div key={index} onClick={() => handleThumbnailClick(index)} />
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen view */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
            onClick={() => setFullscreen(false)}
          >
            <div className="absolute top-4 right-4 flex gap-2">
              <Button 
                size="icon" 
                variant="outline" 
                className="h-10 w-10 rounded-full bg-black/50 border-white/20 text-white hover:bg-black/70"
                onClick={(e) => {
                  e.stopPropagation();
                  setFullscreen(false);
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
              <Button 
                size="icon" 
                variant="outline" 
                className="h-12 w-12 rounded-full bg-black/50 border-white/20 text-white hover:bg-black/70"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage('prev');
                }}
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </div>

            <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
              <Button 
                size="icon" 
                variant="outline" 
                className="h-12 w-12 rounded-full bg-black/50 border-white/20 text-white hover:bg-black/70"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage('next');
                }}
              >
                <ArrowRight className="h-6 w-6" />
              </Button>
            </div>

            <div 
              className="max-w-4xl max-h-[80vh] relative" 
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="overflow-hidden rounded-lg"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
              >
                <AdaptiveImage
                  src={images[currentIndex]}
                  alt={`${alt} - Fullscreen View`}
                  className="w-full h-full object-contain"
                  containerClassName="h-full w-full"
                />
              </motion.div>
            </div>

            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3">
              {images.map((image, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "w-3 h-3 rounded-full cursor-pointer",
                    currentIndex === index ? "bg-white" : "bg-white/30"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleThumbnailClick(index);
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}