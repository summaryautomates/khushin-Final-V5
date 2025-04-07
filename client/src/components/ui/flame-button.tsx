import { Button } from "@/components/ui/button";
import { FlameElement } from "@/components/ui/flame-element";
import { cn } from "@/lib/utils";
import React from "react";

interface FlameButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  intensity?: 'low' | 'medium' | 'high';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const FlameButton = React.forwardRef<HTMLButtonElement, FlameButtonProps>(
  ({ 
    className, 
    children, 
    intensity = 'medium', 
    variant = 'default',
    size = 'default',
    ...props 
  }, ref) => {
    return (
      <FlameElement intensity={intensity} className="w-fit">
        <Button
          ref={ref}
          variant={variant}
          size={size}
          className={cn(
            "relative overflow-hidden transition-all duration-300",
            {
              'hover:bg-primary/90 hover:scale-105': variant === 'default',
              'hover:bg-destructive/90 hover:scale-105': variant === 'destructive',
              'hover:bg-secondary/90 hover:scale-105': variant === 'secondary',
              'hover:bg-transparent hover:scale-105': variant === 'ghost' || variant === 'outline',
            },
            className
          )}
          {...props}
        >
          <span className="relative z-10">{children}</span>
          <div className="absolute inset-0 z-0 opacity-0 bg-gradient-to-r from-amber-500/0 via-amber-500/30 to-amber-500/0 group-hover:opacity-100 transition-opacity duration-300" />
        </Button>
      </FlameElement>
    );
  }
);

FlameButton.displayName = 'FlameButton';