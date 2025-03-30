import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { AdaptiveImage } from "@/components/ui/adaptive-image";
import { cn } from "@/lib/utils";

interface ProductImageGalleryProps {
  images: string[];
  alt: string;
  className?: string;
}

export function ProductImageGallery({ images, alt, className }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  // If there's only one image, render a simple image display
  if (images.length === 1) {
    return (
      <motion.div
        className={cn("relative aspect-square overflow-hidden bg-black", className)}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <AdaptiveImage
          src={images[0] || ""}
          alt={alt}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          containerClassName="h-full w-full"
        />
      </motion.div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Main carousel */}
      <Carousel className="w-full">
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index} className="flex justify-center">
              <motion.div
                className="aspect-square overflow-hidden bg-black rounded-md"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <AdaptiveImage
                  src={image}
                  alt={`${alt} - Image ${index + 1}`}
                  className="w-full h-full object-cover object-center transition-transform duration-500"
                  containerClassName="h-full w-full"
                />
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2 top-1/2 -translate-y-1/2" />
        <CarouselNext className="right-2 top-1/2 -translate-y-1/2" />
      </Carousel>

      {/* Thumbnail strip */}
      <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
        {images.map((image, index) => (
          <div
            key={index}
            className={`flex-shrink-0 w-16 h-16 cursor-pointer rounded-md overflow-hidden border-2 transition-all ${
              selectedImage === index ? "border-primary" : "border-transparent"
            }`}
            onClick={() => setSelectedImage(index)}
          >
            <AdaptiveImage
              src={image}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
              containerClassName="h-full w-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
}