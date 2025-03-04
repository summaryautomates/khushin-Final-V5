import React from 'react';
import { cn } from '@/lib/utils';
import { fallbackLighterDataUrl } from '@/assets/fallback-lighter';
import './luxury-button.css';

interface LuxuryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function LuxuryButton({ 
  children, 
  className,
  variant = 'default',
  size = 'default',
  ...props 
}: LuxuryButtonProps) {
  return (
    <button
      className={cn(
        'luxury-button',
        `luxury-button-${variant}`,
        `luxury-button-${size}`,
        className
      )}
      {...props}
      style={{
        '--background-image': `url(${fallbackLighterDataUrl})`
      } as React.CSSProperties}
    >
      <div className="luxury-button-background" />
      <span className="luxury-button-text">{children}</span>
    </button>
  );
}