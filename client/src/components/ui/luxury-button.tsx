
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import './luxury-button.css';

// Import the image directly if needed
import lighterImagePath from '../../../public/images/khush-lighters.png';

interface LuxuryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export function LuxuryButton({ 
  children, 
  className, 
  ...props 
}: LuxuryButtonProps) {
  const [imagePath, setImagePath] = useState<string | null>(null);
  
  useEffect(() => {
    // Try to load the image
    const img = new Image();
    img.onload = () => {
      setImagePath(img.src);
    };
    img.onerror = () => {
      console.error("Failed to load luxury button image");
      // Try alternate path
      const altImg = new Image();
      altImg.src = lighterImagePath;
      altImg.onload = () => setImagePath(altImg.src);
      altImg.onerror = () => {
        console.error("Failed to load alternate image path");
      };
    };
    img.src = '/images/khush-lighters.png';
  }, []);

  return (
    <button
      className={cn('luxury-button', className)}
      style={imagePath ? { 
        backgroundImage: `url(${imagePath})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } : {}}
      {...props}
    >
      <span className="luxury-button-text">{children}</span>
    </button>
  );
}
