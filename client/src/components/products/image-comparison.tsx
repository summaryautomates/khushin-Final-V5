import { useState, useEffect, useRef } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { motion } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";

interface ImageComparisonProps {
  images: string[];
  titles: string[];
}

export function ImageComparison({ images, titles }: ImageComparisonProps) {
  const [loading, setLoading] = useState<boolean[]>(new Array(images.length).fill(true));
  const [errors, setErrors] = useState<boolean[]>(new Array(images.length).fill(false));
  const transformRefs = useRef<any[]>([]);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      // Cleanup transform refs
      transformRefs.current = [];
    };
  }, []);

  // Initialize refs array when images change
  useEffect(() => {
    transformRefs.current = new Array(images.length).fill(null);
  }, [images.length]);

  // Synchronize zoom levels between instances with error handling
  const handleZoom = (index: number, scale: number) => {
    try {
      transformRefs.current.forEach((ref, i) => {
        if (i !== index && ref?.state && !errors[i]) {
          ref.setTransform(ref.state.positionX, ref.state.positionY, scale);
        }
      });
    } catch (error) {
      console.error("Error synchronizing zoom:", error);
    }
  };

  // Handle image load state with error boundary
  const handleImageLoad = (index: number) => {
    if (!isMounted.current) return;

    setLoading(prev => {
      const newLoading = [...prev];
      newLoading[index] = false;
      return newLoading;
    });

    setErrors(prev => {
      const newErrors = [...prev];
      newErrors[index] = false;
      return newErrors;
    });
  };

  // Handle image error state
  const handleImageError = (index: number) => {
    if (!isMounted.current) return;

    setErrors(prev => {
      const newErrors = [...prev];
      newErrors[index] = true;
      return newErrors;
    });

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
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}

          {errors[index] ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-sm text-muted-foreground">Failed to load image</p>
            </div>
          ) : (
            <TransformWrapper
              ref={ref => {
                if (ref && isMounted.current) {
                  transformRefs.current[index] = ref;
                }
              }}
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
                  onError={() => handleImageError(index)}
                  style={{
                    opacity: loading[index] ? 0 : 1,
                    transition: 'opacity 0.3s ease-in-out'
                  }}
                />
              </TransformComponent>
            </TransformWrapper>
          )}

          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm text-center">
            {titles[index]}
          </div>
        </motion.div>
      ))}
    </div>
  );
}