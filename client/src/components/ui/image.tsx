import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
  type?: 'product' | 'banner';
}

export function Image({ 
  src, 
  alt, 
  className, 
  fallback,
  type = 'product',
  ...props 
}: ImageProps) {
  const [error, setError] = useState(false);

  // Default fallbacks based on type
  const defaultFallback = type === 'banner' 
    ? '/placeholders/banner.svg' 
    : '/placeholders/product.svg';

  // Use either provided fallback or default based on type
  const fallbackSrc = fallback || defaultFallback;

  return (
    <img
      src={error ? fallbackSrc : src}
      alt={alt}
      className={cn(
        'transition-opacity duration-300',
        error ? 'opacity-70' : 'opacity-100',
        className
      )}
      onError={() => {
        console.log(`Image failed to load: ${src}, using fallback:`, fallbackSrc);
        setError(true);
      }}
      {...props}
    />
  );
}