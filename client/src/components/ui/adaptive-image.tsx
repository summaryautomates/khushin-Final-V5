import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Default fallback images that will be tried in order
const FALLBACK_IMAGES = [
  "/placeholders/product-placeholder.svg",
  "/placeholders/placeholder-product-2.svg",
  "/placeholders/placeholder-product-3.svg",
  "/placeholders/error-placeholder.svg" // Final fallback
];

interface AdaptiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackImages?: string[];
  showLoader?: boolean;
  className?: string;
  containerClassName?: string;
  onLoadError?: (error: string) => void;
}

export function AdaptiveImage({
  src,
  alt,
  fallbackImages = FALLBACK_IMAGES,
  showLoader = true,
  className,
  containerClassName,
  onLoadError,
  ...props
}: AdaptiveImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [fallbackIndex, setFallbackIndex] = useState(-1); // -1 means using original src
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // Reset states when src changes
  useEffect(() => {
    setCurrentSrc(src);
    setFallbackIndex(-1);
    setHasError(false);
    setIsLoading(true);
    setRetryCount(0);
  }, [src]);

  const handleError = () => {
    // First try to reload the original image
    if (retryCount < MAX_RETRIES && fallbackIndex === -1) {
      setRetryCount(prev => prev + 1);
      // Add cache buster to force reload
      setCurrentSrc(`${src}?retry=${Date.now()}`);
      console.warn(`Retrying original image load (${retryCount + 1}/${MAX_RETRIES}):`, src);
      return;
    }

    const nextIndex = fallbackIndex + 1;
    if (nextIndex < fallbackImages.length) {
      console.warn(`Image load failed for ${currentSrc}, trying fallback: ${fallbackImages[nextIndex]}`);
      setCurrentSrc(fallbackImages[nextIndex]);
      setFallbackIndex(nextIndex);
      onLoadError?.(`Failed to load image: ${currentSrc}`);
    } else {
      console.error('All fallback images failed to load');
      setHasError(true);
      setIsLoading(false);
      onLoadError?.('All fallback images failed to load');
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      {isLoading && showLoader && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
      {hasError ? (
        <div className="flex items-center justify-center h-full min-h-[100px] bg-muted">
          <span className="text-sm text-muted-foreground">Image not available</span>
        </div>
      ) : (
        <img
          {...props}
          src={currentSrc}
          alt={alt}
          className={cn(
            className,
            "transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          onError={handleError}
          onLoad={handleLoad}
        />
      )}
    </div>
  );
}