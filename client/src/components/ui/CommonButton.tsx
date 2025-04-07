import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button, ButtonProps } from './button';

// Import existing luxury styles
import './luxury-button.css';

interface CommonButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'luxury' | 'ghost' | 'link';
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  glint?: boolean;
}

/**
 * CommonButton component that unifies the standard Button with luxury styling options
 * 
 * @param variant - Button style variant, including a 'luxury' option that uses the luxury styles
 * @param iconLeft - Optional icon to display on the left side
 * @param iconRight - Optional icon to display on the right side
 * @param glint - Whether to show the glint animation (only applies to luxury variant)
 * @param children - Button content
 * @param className - Additional CSS classes
 */
export function CommonButton({
  children,
  className,
  variant = 'default',
  size = 'default',
  iconLeft,
  iconRight,
  glint = true,
  ...props
}: CommonButtonProps) {
  // For luxury variant, we use the custom implementation
  if (variant === 'luxury') {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
      <motion.button
        className={cn(
          'luxury-button',
          `luxury-button-${size}`,
          className
        )}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ y: -2 }}
        whileTap={{ y: 1 }}
        transition={{ duration: 0.2 }}
        type={props.type}
        disabled={props.disabled}
        onClick={props.onClick}
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
  
  // For standard variants, use the shadcn Button component as a base
  // Convert our custom variant type to the standard Button variant type
  const buttonVariant = variant === 'luxury' ? 'default' : variant;
  
  return (
    <Button
      className={cn(
        // Apply any custom icon spacing if needed
        iconLeft || iconRight ? 'inline-flex items-center justify-center gap-2' : '',
        className
      )}
      variant={buttonVariant as any} // Type assertion to avoid the conflict
      size={size}
      {...props}
    >
      {iconLeft && <span>{iconLeft}</span>}
      {children}
      {iconRight && <span>{iconRight}</span>}
    </Button>
  );
}