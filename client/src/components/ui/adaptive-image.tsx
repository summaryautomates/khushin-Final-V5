import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Default fallback images that will be tried in order
const FALLBACK_IMAGES = [
  "/product-placeholder.svg",
  "/placeholder-product-2.svg",
  "/placeholder-product-3.svg"
];

interface AdaptiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackImages?: string[];
  showLoader?: boolean;
  className?: string;
  containerClassName?: string;
}

export function AdaptiveImage({
  src,
  alt,
  fallbackImages = FALLBACK_IMAGES,
  showLoader = true,
  className,
  containerClassName,
  ...props
}: AdaptiveImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [fallbackIndex, setFallbackIndex] = useState(-1); // -1 means using original src

  const handleError = () => {
    const nextIndex = fallbackIndex + 1;
    if (nextIndex < fallbackImages.length) {
      console.log(`Image failed to load, trying fallback: ${fallbackImages[nextIndex]}`);
      setCurrentSrc(fallbackImages[nextIndex]);
      setFallbackIndex(nextIndex);
    } else {
      console.error('All fallback images failed to load');
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    console.log('Image loaded successfully:', currentSrc);
    setIsLoading(false);
  };

  return (
    <div className={cn("relative", containerClassName)}>
      {isLoading && showLoader && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
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
    </div>
  );
}
