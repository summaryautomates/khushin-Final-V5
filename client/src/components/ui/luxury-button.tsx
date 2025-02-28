import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import './luxury-button.css';
import { fallbackLighterDataUrl } from '../../../public/images/fallback-lighter.js';

// Custom hook to try multiple image sources
function useImageWithFallback(sources: string[]) {
  const [validSrc, setValidSrc] = useState<string | null>(null);

  useEffect(() => {
    const tryImages = async () => {
      for (const src of sources) {
        try {
          const img = new Image();
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject();
            img.src = src;
          });
          setValidSrc(src);
          return;
        } catch (e) {
          console.error(`Failed to load image: ${src}`);
        }
      }
      // If all fail, set to fallback data URL
      setValidSrc(fallbackLighterDataUrl);
    };

    tryImages();
  }, [sources]);

  return validSrc;
}

interface LuxuryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export function LuxuryButton({ 
  children, 
  className, 
  ...props 
}: LuxuryButtonProps) {
  const imageSrc = useImageWithFallback([
    '/images/khush-lighters.png',
    'https://images.unsplash.com/photo-1576969500732-12cc9992a5f4?q=80&w=500',
    fallbackLighterDataUrl
  ]);

  return (
    <button
      className={cn('luxury-button', className)}
      style={imageSrc ? {
        '--bg-image': `url(${imageSrc})`,
      } as React.CSSProperties : undefined}
      {...props}
    >
      <span className="luxury-button-text">{children}</span>
    </button>
  );
}