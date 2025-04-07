import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Button, ButtonProps } from '@/components/ui/button';
import { FlameElement } from '@/components/ui/flame-element';

interface FlameButtonProps extends ButtonProps {
  flameIntensity?: 'low' | 'medium' | 'high';
}

export const FlameButton = forwardRef<HTMLButtonElement, FlameButtonProps>(
  ({ children, className, flameIntensity = 'medium', ...props }, ref) => {
    return (
      <FlameElement intensity={flameIntensity}>
        <Button
          ref={ref}
          className={cn(
            'relative overflow-hidden transition-all duration-300',
            {
              'hover:shadow-lg hover:shadow-orange-500/20': flameIntensity === 'low',
              'hover:shadow-xl hover:shadow-orange-500/30': flameIntensity === 'medium',
              'hover:shadow-2xl hover:shadow-orange-500/40': flameIntensity === 'high',
            },
            className
          )}
          {...props}
        >
          {/* Create a subtle flame gradient on hover */}
          <span 
            className="absolute inset-0 opacity-0 transition-opacity duration-300 
                      bg-gradient-to-t from-orange-600/10 to-yellow-400/5 
                      group-hover:opacity-100 pointer-events-none" 
          />
          
          {children}
        </Button>
      </FlameElement>
    );
  }
);

FlameButton.displayName = 'FlameButton';