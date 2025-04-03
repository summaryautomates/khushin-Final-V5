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
import { ArrowLeft, ArrowRight } from "lucide-react";

interface ProductImageGalleryProps {
  images: string[];
  alt: string;
  className?: string;
  showThumbnails?: boolean;
}

export function ProductImageGallery({ images, alt, className, showThumbnails = true }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      const selectedSlide = api.selectedScrollSnap();
      setCurrentIndex(selectedSlide);
      setSelectedImage(selectedSlide);
    });
  }, [api]);

  const handleThumbnailClick = useCallback((index: number) => {
    setSelectedImage(index);
    if (api && typeof api.scrollTo === 'function') {
      api.scrollTo(index);
    }
  }, [api]);

  // If there's only one image, render a simple image display
  if (images.length === 1) {
    return (
      <motion.div
        className={cn("relative aspect-square overflow-hidden bg-black rounded-lg", className)}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <AdaptiveImage
          src={images[0] || ""}
          alt={alt}
          className="w-full h-full object-contain object-center transition-transform duration-500 hover:scale-105"
          containerClassName="h-full w-full bg-zinc-900"
        />
      </motion.div>
    );
  }

  return (
    <>
      <div className={cn("space-y-4", className)}>
        {/* Main carousel - simplified */}
        <div className="relative">
          <Carousel className="w-full" setApi={setApi}>
            <CarouselContent>
              {images.map((image, index) => (
                <CarouselItem key={index} className="flex justify-center">
                  <motion.div
                    className="aspect-square overflow-hidden bg-black rounded-lg relative"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AdaptiveImage
                      src={image}
                      alt={`${alt} - Image ${index + 1}`}
                      className="w-full h-full object-contain object-center transition-duration-300"
                      containerClassName="h-full w-full bg-zinc-900"
                    />
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious 
              className="left-2 top-1/2 -translate-y-1/2 bg-black/80 hover:bg-black border-none shadow-md text-white w-8 h-8 opacity-80 hover:opacity-100"
            />
            <CarouselNext 
              className="right-2 top-1/2 -translate-y-1/2 bg-black/80 hover:bg-black border-none shadow-md text-white w-8 h-8 opacity-80 hover:opacity-100"
            />
          </Carousel>

          {/* Improved image counter */}
          <div className="absolute bottom-3 right-3 bg-black/80 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md z-10">
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
    </>
  );
}