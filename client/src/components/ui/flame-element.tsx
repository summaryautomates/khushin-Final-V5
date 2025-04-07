import React, { forwardRef, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface FlameElementProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: 'low' | 'medium' | 'high';
  children: React.ReactNode;
}

export const FlameElement = forwardRef<HTMLDivElement, FlameElementProps>(
  ({ children, className, intensity = 'medium', ...props }, ref) => {
    const elementRef = useRef<HTMLDivElement | null>(null);
    const mergedRef = (node: HTMLDivElement) => {
      elementRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    useEffect(() => {
      const element = elementRef.current;
      if (!element) return;

      // Add a data attribute to mark this as a flame element
      // This will be used by the FlameCursor component to identify interactive elements
      element.setAttribute('data-flame-element', intensity);

      return () => {
        element.removeAttribute('data-flame-element');
      };
    }, [intensity]);

    return (
      <div
        ref={mergedRef}
        className={cn(
          'relative group',
          {
            'transition-shadow duration-300': true,
            'hover:shadow-sm': intensity === 'low',
            'hover:shadow-md': intensity === 'medium',
            'hover:shadow-lg': intensity === 'high',
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

FlameElement.displayName = 'FlameElement';