import { useState, useEffect, useRef } from "react";
import { Loader2, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Default fallback images that will be tried in order
const FALLBACK_IMAGES = [
  "/placeholders/product-placeholder.svg",
  "/placeholders/error-placeholder.svg" // Final fallback
];

interface AdaptiveImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  onLoadSuccess?: () => void;
  onLoadFailure?: () => void;
  fallbackSrc?: string;
}

export function AdaptiveImage({
  src,
  alt,
  className = "",
  containerClassName = "",
  objectFit = "cover",
  onLoadSuccess,
  onLoadFailure,
  fallbackSrc
}: AdaptiveImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [fallbackIndex, setFallbackIndex] = useState<number>(0);
  const attemptedSrcs = useRef<Set<string>>(new Set());

  // Reset state when src changes
  useEffect(() => {
    if (src !== currentSrc && !attemptedSrcs.current.has(src)) {
      setCurrentSrc(src);
      setLoading(true);
      setError(false);
    }
  }, [src, currentSrc]);

  const handleImageLoad = () => {
    setLoading(false);
    setError(false);
    if (onLoadSuccess) onLoadSuccess();
    console.log(`Image loaded successfully: ${currentSrc}`);
  };

  const handleImageError = () => {
    console.error(`Image load error: ${currentSrc}`);
    attemptedSrcs.current.add(currentSrc);

    // Try custom fallback first if provided
    if (fallbackSrc && !attemptedSrcs.current.has(fallbackSrc)) {
      setCurrentSrc(fallbackSrc);
      return;
    }

    // Otherwise try our array of fallbacks
    if (fallbackIndex < FALLBACK_IMAGES.length) {
      const nextFallback = FALLBACK_IMAGES[fallbackIndex];
      if (!attemptedSrcs.current.has(nextFallback)) {
        setCurrentSrc(nextFallback);
        setFallbackIndex(fallbackIndex + 1);
        return;
      }
    }

    // If we've tried all fallbacks, show error state
    setLoading(false);
    setError(true);
    if (onLoadFailure) onLoadFailure();
  };

  return (
    <div className={cn("relative", containerClassName)}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error ? (
        <div className="w-full h-full flex items-center justify-center bg-muted/10">
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