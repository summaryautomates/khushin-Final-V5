import { useState, useEffect, useRef } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface ImageComparisonProps {
  images: string[];
  titles: string[];
}

export function ImageComparison({ images, titles }: ImageComparisonProps) {
  const [loading, setLoading] = useState<boolean[]>(new Array(images.length).fill(true));
  const transformRefs = useRef<any[]>([]);

  // Synchronize zoom levels between instances
  const handleZoom = (index: number, scale: number) => {
    transformRefs.current.forEach((ref, i) => {
      if (i !== index && ref?.state) {
        ref.setTransform(ref.state.positionX, ref.state.positionY, scale);
      }
    });
  };

  // Handle image load state
  const handleImageLoad = (index: number) => {
    setLoading(prev => {
      const newLoading = [...prev];
      newLoading[index] = false;
      return newLoading;
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {images.map((image, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.2 }}
          className="relative aspect-square bg-zinc-100 rounded-lg overflow-hidden"
        >
          {loading[index] && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
          <TransformWrapper
            ref={ref => transformRefs.current[index] = ref}
            onZoom={(ref) => handleZoom(index, ref.state.scale)}
            centerOnInit
            limitToBounds
            minScale={1}
            maxScale={4}
            initialScale={1}
          >
            <TransformComponent 
              wrapperClass="!w-full !h-full"
              contentClass="!w-full !h-full"
            >
              <img
                src={image}
                alt={titles[index]}
                className="w-full h-full object-cover"
                onLoad={() => handleImageLoad(index)}
                style={{
                  opacity: loading[index] ? 0 : 1,
                  transition: 'opacity 0.3s ease-in-out'
                }}
              />
            </TransformComponent>
          </TransformWrapper>
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm text-center">
            {titles[index]}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
