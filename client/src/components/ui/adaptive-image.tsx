
import { useState, useEffect, useRef } from "react";
import { Loader2, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Default fallback images that will be tried in order
const FALLBACK_IMAGES = [
  "/placeholders/product-placeholder.svg",
  "/placeholders/image-placeholder.svg" // Final fallback
];

interface AdaptiveImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  onLoadSuccess?: () => void;
  onLoadFailure?: () => void;
  fallbackSrc?: string;
}

export function AdaptiveImage({
  src,
  alt,
  className,
  containerClassName,
  onLoadSuccess,
  onLoadFailure,
  fallbackSrc = "/placeholders/product-placeholder.svg"
}: AdaptiveImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const imageRef = useRef<HTMLImageElement>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (src !== currentSrc && !error) {
      setCurrentSrc(src);
      setLoading(true);
      setError(false);
    }
  }, [src]);

  const handleLoad = () => {
    if (mounted.current) {
      console.log(`Image loaded successfully: ${currentSrc}`);
      setLoading(false);
      setError(false);
      if (onLoadSuccess) onLoadSuccess();
    }
  };

  const handleError = () => {
    if (!mounted.current) return;
    
    console.error(`Image load error: Failed to load image: ${currentSrc}`);
    
    if (fallbackIndex < FALLBACK_IMAGES.length) {
      const nextFallback = fallbackSrc || FALLBACK_IMAGES[fallbackIndex];
      console.log(`Trying fallback image: ${nextFallback}`);
      setCurrentSrc(nextFallback);
      setFallbackIndex(prev => prev + 1);
    } else {
      setError(true);
      setLoading(false);
      if (onLoadFailure) onLoadFailure();
    }
  };

  // Check if src is empty or invalid
  const validatedSrc = currentSrc && currentSrc.trim() !== '' 
    ? currentSrc 
    : (fallbackSrc || FALLBACK_IMAGES[0]);

  return (
    <div className={cn("relative", containerClassName)}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 rounded-md">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-100 rounded-md p-2">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
          <p className="text-xs text-muted-foreground mt-2 text-center">Image not available</p>
        </div>
      )}
      
      <img
        ref={imageRef}
        src={validatedSrc}
        alt={alt || "Image"}
        className={cn("transition-opacity duration-300", 
          loading || error ? "opacity-0" : "opacity-100", 
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}
