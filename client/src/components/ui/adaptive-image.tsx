
import { useState, useEffect, useRef } from "react";
import { Loader2, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Default fallback images that will be tried in order
const FALLBACK_IMAGES = [
  "/placeholders/product-placeholder.svg",
  "/placeholders/error-placeholder.svg" // Final fallback
];

interface AdaptiveImageProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  showLoader?: boolean;
  onLoadSuccess?: () => void;
  onLoadFailure?: () => void;
  fallbackSrc?: string;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
}

export function AdaptiveImage({
  src,
  alt,
  className,
  containerClassName,
  showLoader = true,
  onLoadSuccess,
  onLoadFailure,
  fallbackSrc,
  objectFit = "cover",
  ...props
}: AdaptiveImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [fallbackIndex, setFallbackIndex] = useState<number>(0);
  const isMounted = useRef<boolean>(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (src) {
      setCurrentSrc(src);
      setLoading(true);
      setError(false);
      setFallbackIndex(0);
    }
  }, [src]);

  const handleImageLoad = () => {
    if (!isMounted.current) return;
    
    setLoading(false);
    setError(false);
    if (onLoadSuccess) onLoadSuccess();
    
    console.log("Image loaded successfully:", currentSrc);
  };

  const handleImageError = () => {
    if (!isMounted.current) return;
    
    console.error("Image load error:", `Failed to load image: ${currentSrc}`);
    
    // Try the custom fallback first if provided
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      return;
    }
    
    // Try the next fallback image from our array
    const nextFallbackIndex = fallbackIndex + 1;
    if (nextFallbackIndex < FALLBACK_IMAGES.length) {
      setFallbackIndex(nextFallbackIndex);
      setCurrentSrc(FALLBACK_IMAGES[nextFallbackIndex]);
    } else {
      setLoading(false);
      setError(true);
      if (onLoadFailure) onLoadFailure();
    }
  };

  return (
    <div 
      className={cn(
        "relative overflow-hidden", 
        containerClassName
      )}
      {...props}
    >
      {loading && showLoader && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {error ? (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <ImageIcon className="h-10 w-10 text-muted-foreground" />
        </div>
      ) : (
        <img
          src={currentSrc}
          alt={alt}
          className={cn(
            "transition-opacity duration-300",
            loading ? "opacity-0" : "opacity-100",
            `object-${objectFit}`,
            className
          )}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
    </div>
  );
}
