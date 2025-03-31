import { useState, useEffect, useRef } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, ImageIcon } from "lucide-react";
import { ErrorBoundary } from "@/components/error-boundary";

interface ImageComparisonProps {
  images: string[];
  titles: string[];
}

// Separate ImageComponent for better error handling
import { AdaptiveImage } from "../ui/adaptive-image";

const ImageComponent = ({ src, alt, onLoad, onError }: {
  src: string;
  alt: string;
  onLoad: () => void;
  onError: () => void;
}) => {
  const handleLoad = () => {
    console.log(`Image loaded successfully: ${src}`);
    onLoad();
  };
  
  const handleError = () => {
    console.error(`Image load error: Failed to load image: ${src}`);
    onError();
  };
  
  // Ensure the src is a valid URL
  const validSrc = src && src.trim() !== '' ? src : '/placeholders/product-placeholder.svg';
  
  return (
    <AdaptiveImage
      src={validSrc}
      alt={alt || 'Product image'}
      className="w-full h-full object-cover"
      containerClassName="w-full h-full"
      onLoadSuccess={handleLoad}
      onLoadFailure={handleError}
      fallbackSrc="/placeholders/product-placeholder.svg"
    />
  );
};

export function ImageComparison({ images, titles }: ImageComparisonProps) {
  const [loading, setLoading] = useState<boolean[]>(new Array(images.length).fill(true));
  const [errors, setErrors] = useState<boolean[]>(new Array(images.length).fill(false));
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<number, boolean>>({});
  const [fallbackImageIndex, setFallbackImageIndex] = useState(0);
  const FALLBACK_IMAGES = [
    "/placeholders/image-placeholder.svg", 
    "/placeholders/product-placeholder.svg"
  ];
  const transformRefs = useRef<any[]>([]);
  const isMounted = useRef(true);

  // Default placeholder image from public directory
  const placeholderImage = "/placeholders/image-placeholder.svg";

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    transformRefs.current = new Array(images.length).fill(null);
    setImageErrors({}); // Initialize imageErrors on mount
    setImageLoadingStates({}); // Initialize imageLoadingStates on mount
  }, [images.length]);

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

  const getValidProductImage = (index: number): string => {
    if (errors[index] || imageErrors[index]) {
      // Ensure we have a valid fallback image
      console.log(`Using fallback image for index ${index}`);
      return '/placeholders/product-placeholder.svg';
    }
    
    // Check if the image URL is valid before returning
    const imageUrl = images[index];
    
    if (!imageUrl || imageUrl.trim() === '') {
      console.log(`Empty image URL at index ${index}, using placeholder`);
      return '/placeholders/product-placeholder.svg';
    }
    
    // Handle relative URLs properly
    if (imageUrl.startsWith('/') && !imageUrl.startsWith('/placeholders/')) {
      const fixedUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
      console.log(`Using relative image URL at index ${index}: ${fixedUrl}`);
      return fixedUrl;
    }
    
    // Log the image URL we're trying to use
    console.log(`Using image URL at index ${index}: ${imageUrl}`);
    return imageUrl;
  };

  const handleImageError = (index: number) => {
    if (!isMounted.current) return;

    // Log detailed error information
    console.error(`Image loading failed at index ${index}:`, {
      originalUrl: images[index],
      fallbackUrl: '/placeholders/product-placeholder.svg',
      errorCount: Object.values(imageErrors).filter(Boolean).length,
      timestamp: new Date().toISOString()
    });
    
    // Set image error state to trigger fallback
    const newImageErrors = { ...imageErrors };
    newImageErrors[index] = true;
    setImageErrors(newImageErrors);

    setImageErrors(prev => ({ ...prev, [index]: true }));
    setImageLoadingStates(prev => ({ ...prev, [index]: false }));

    // Try next fallback image
    setFallbackImageIndex(prev => prev + 1);
  };

  const handleImageLoad = (index: number) => {
    if (!isMounted.current) return;

    // Log successful image load
    console.log(`Image loaded successfully at index ${index}:`, {
      url: getValidProductImage(index),
      timestamp: new Date().toISOString()
    });

    setImageLoadingStates(prev => ({ ...prev, [index]: false }));
    setImageErrors(prev => ({ ...prev, [index]: false }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {images.map((image, index) => (
        <ErrorBoundary key={index} fallback={
          <div className="aspect-square bg-black rounded-lg flex items-center justify-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
        }>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className="relative aspect-square bg-black rounded-lg overflow-hidden"
          >
            {imageLoadingStates[index] && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}

            {imageErrors[index] ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Failed to load image</p>
                <img
                  src={placeholderImage}
                  alt="Placeholder"
                  className="absolute inset-0 w-full h-full object-cover opacity-50"
                />
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
                  <ImageComponent
                    src={getValidProductImage(index)}
                    alt={titles[index]}
                    onLoad={() => handleImageLoad(index)}
                    onError={() => handleImageError(index)}
                  />
                </TransformComponent>
              </TransformWrapper>
            )}

            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm text-center">
              {titles[index]}
            </div>
          </motion.div>
        </ErrorBoundary>
      ))}
    </div>
  );
}