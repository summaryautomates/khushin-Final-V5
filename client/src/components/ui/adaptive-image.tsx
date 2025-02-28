import { useState, useEffect, useRef } from "react";
import { Loader2, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Default fallback images that will be tried in order
const FALLBACK_IMAGES = [
  "/placeholders/product-placeholder.svg",
  "/placeholders/placeholder-product-2.svg",
  "/placeholders/placeholder-product-3.svg",
  "/placeholders/error-placeholder.svg" // Final fallback
];

interface AdaptiveImageProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  showLoader?: boolean;
}

export function AdaptiveImage({
  src,
  alt,
  className,
  containerClassName,
  showLoader = true,
  ...props
}: AdaptiveImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [fallbackIndex, setFallbackIndex] = useState(-1); // Start with original image
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    // Reset state when src changes
    if (mounted.current) {
      setLoading(true);
      setError(false);
      setCurrentSrc(src);
      setFallbackIndex(-1);
    }
  }, [src]);

  const handleImageLoad = () => {
    if (mounted.current) {
      setLoading(false);
      setError(false);
    }
  };

  const handleImageError = () => {
    if (!mounted.current) return;

    console.log("Image load error:", `Failed to load image: ${currentSrc}`);

    // Try next fallback image
    const nextIndex = fallbackIndex + 1;
    if (nextIndex < FALLBACK_IMAGES.length) {
      setFallbackIndex(nextIndex);
      setCurrentSrc(FALLBACK_IMAGES[nextIndex]);
    } else {
      // If all fallbacks failed, show error state
      setLoading(false);
      setError(true);
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
            className
          )}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
    </div>
  );
}