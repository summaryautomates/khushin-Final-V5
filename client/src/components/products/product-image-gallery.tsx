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

  // If there's only one image or no images, render a simple image display
  if (!images || images.length === 0 || images.length === 1) {
    return (
      <div className={cn("relative w-full h-full", className)}>
        <AdaptiveImage
          src={images && images.length > 0 ? images[0] : ""}
          alt={alt}
          className="w-full h-full object-contain object-center"
          containerClassName="h-full w-full"
          fallbackSrc="/placeholders/product-placeholder.svg"
        />
      </div>
    );
  }

  return (
    <>
      <div className={cn("h-full w-full", className)}>
        {/* Main carousel - simplified */}
        <div className="relative h-full w-full">
          <Carousel className="w-full h-full" setApi={setApi}>
            <CarouselContent className="h-full w-full">
              {images.map((image, index) => (
                <CarouselItem key={index} className="flex justify-center items-center h-full w-full">
                  <div className="w-full h-full">
                    <AdaptiveImage
                      src={image}
                      alt={`${alt} - Image ${index + 1}`}
                      className="w-full h-full object-contain object-center"
                      containerClassName="h-full w-full"
                      fallbackSrc="/placeholders/product-placeholder.svg"
                    />
                  </div>
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
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={cn(
                    "flex-shrink-0 w-16 h-16 cursor-pointer rounded-md overflow-hidden transition-all duration-300 relative group",
                    selectedImage === index 
                      ? "ring-2 ring-primary shadow-md" 
                      : "ring-1 ring-gray-200 hover:ring-primary/70"
                  )}
                  onClick={() => handleThumbnailClick(index)}
                >
                  <motion.div 
                    className={cn(
                      "absolute inset-0 z-10 transition-opacity duration-300",
                      selectedImage === index 
                        ? "bg-primary/20" 
                        : "bg-black/30 opacity-0 group-hover:opacity-100"
                    )}
                  />
                  <AdaptiveImage
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
                    containerClassName="h-full w-full"
                    fallbackSrc="/placeholders/product-placeholder.svg"
                  />
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