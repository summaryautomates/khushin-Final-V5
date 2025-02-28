import React from 'react';
import { cn } from '@/lib/utils';
import './luxury-button.css';

interface LuxuryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function LuxuryButton({ 
  children, 
  className, 
  ...props 
}: LuxuryButtonProps) {
  return (
    <button
      className={cn('luxury-button', className)}
      {...props}
    >
      <div className="luxury-button-background" />
      <span className="luxury-button-text">{children}</span>
    </button>
  );
}