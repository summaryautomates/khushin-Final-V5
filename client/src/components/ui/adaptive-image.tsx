import { useState, useEffect } from "react";
import { Loader2, ImageIcon } from "lucide-react";
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
  priority?: boolean;
}

export function AdaptiveImage({
  src,
  alt,
  fallbackImages = FALLBACK_IMAGES,
  showLoader = true,
  className,
  containerClassName,
  onLoadError,
  priority = false,
  ...props
}: AdaptiveImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [fallbackIndex, setFallbackIndex] = useState(-1);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    setCurrentSrc(src);
    setFallbackIndex(-1);
    setHasError(false);
    setIsLoading(true);
    setRetryCount(0);

    // Preload the image if priority is true
    if (priority) {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'image';
      preloadLink.href = src;
      document.head.appendChild(preloadLink);
      return () => {
        document.head.removeChild(preloadLink);
      };
    }
  }, [src, priority]);

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
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}
      {hasError ? (
        <div className="flex items-center justify-center h-full min-h-[100px] bg-muted rounded-md">
          <div className="flex flex-col items-center gap-2 text-center p-4">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Image not available</p>
          </div>
        </div>
      ) : (
        <picture>
          <source srcSet={currentSrc} type="image/webp" />
          <source srcSet={currentSrc} type="image/jpeg" />
          <img
            {...props}
            src={currentSrc}
            alt={alt}
            className={cn(
              "transition-opacity duration-300 w-full h-full object-cover",
              isLoading ? "opacity-0" : "opacity-100",
              className
            )}
            onError={handleError}
            onLoad={handleLoad}
            loading={priority ? "eager" : "lazy"}
          />
        </picture>
      )}
    </div>
  );
}