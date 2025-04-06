import React, { useState } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import './luxury-button.css';

interface LuxuryButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  glint?: boolean;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  form?: string;
  name?: string;
  value?: string;
}

export function LuxuryButton({ 
  children, 
  className,
  variant = 'default',
  size = 'default',
  iconLeft,
  iconRight,
  glint = true,
  onClick,
  disabled,
  type = "button",
  ...props 
}: LuxuryButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.button
      className={cn(
        'luxury-button',
        `luxury-button-${variant}`,
        `luxury-button-${size}`,
        className
      )}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -2 }}
      whileTap={{ y: 1 }}
      transition={{ duration: 0.2 }}
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        '--background-image': `url(/images/dark-texture.png)`
      } as React.CSSProperties}
    >
      <div className="luxury-button-background" />
      
      {/* Animated shine/glint effect */}
      {glint && (
        <div 
          className={cn(
            "absolute inset-0 overflow-hidden pointer-events-none z-0",
            isHovered ? "active-glint" : ""
          )}
        >
          <div className="glint-effect" />
        </div>
      )}
      
      <span className="luxury-button-text flex items-center justify-center gap-2">
        {iconLeft && <span className="icon-left">{iconLeft}</span>}
        {children}
        {iconRight && <span className="icon-right">{iconRight}</span>}
      </span>
      
      {/* Gold gradient border */}
      <div className={cn(
        "absolute inset-0 border-0 luxury-button-border",
        isHovered ? "opacity-100" : "opacity-0"
      )} />
    </motion.button>
  );
}