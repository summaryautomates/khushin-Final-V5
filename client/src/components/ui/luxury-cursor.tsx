import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CursorPosition {
  x: number;
  y: number;
}

interface TrailPoint extends CursorPosition {
  id: number;
  size: number;
  opacity: number;
}

export function LuxuryCursor() {
  const [position, setPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [isPointer, setIsPointer] = useState(false);
  const [isHidden, setIsHidden] = useState(true);
  const [isClicking, setIsClicking] = useState(false);
  const [activeLuxuryElement, setActiveLuxuryElement] = useState<HTMLElement | null>(null);
  
  // Maximum number of trail points
  const maxTrailPoints = 15;
  // Track previous position for velocity calculation
  const prevPosition = useRef<CursorPosition>({ x: 0, y: 0 });
  // Track movement speed for dynamic effects
  const [speed, setSpeed] = useState(0);
  
  // Handle element luxury hover effects
  const updateLuxuryElements = useCallback((mouseX: number, mouseY: number) => {
    const elements = document.querySelectorAll('[data-luxury-hover="true"]');
    
    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      // Calculate relative mouse position within the element
      const relativeX = ((mouseX - rect.left) / rect.width) * 100;
      const relativeY = ((mouseY - rect.top) / rect.height) * 100;
      
      // Only apply effect if mouse is close to or inside the element
      const isCloseToElement = 
        mouseX >= rect.left - 50 && 
        mouseX <= rect.right + 50 && 
        mouseY >= rect.top - 50 && 
        mouseY <= rect.bottom + 50;
      
      if (isCloseToElement) {
        (el as HTMLElement).style.setProperty('--mouse-x', `${relativeX}%`);
        (el as HTMLElement).style.setProperty('--mouse-y', `${relativeY}%`);
        
        if (!activeLuxuryElement) {
          setActiveLuxuryElement(el as HTMLElement);
        }
      } else if (activeLuxuryElement === el) {
        setActiveLuxuryElement(null);
      }
    });
  }, [activeLuxuryElement]);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const newPosition = { x: e.clientX, y: e.clientY };
      setPosition(newPosition);
      setIsHidden(false);
      
      // Calculate cursor movement speed
      const dx = newPosition.x - prevPosition.current.x;
      const dy = newPosition.y - prevPosition.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const newSpeed = Math.min(distance, 30); // Cap the speed value
      setSpeed(newSpeed);
      
      // Update previous position
      prevPosition.current = newPosition;
      
      // Get target element and check if it's a button, link, or has a pointer cursor
      const target = e.target as HTMLElement;
      const computedStyle = window.getComputedStyle(target);
      const hasPointerCursor = 
        computedStyle.cursor === 'pointer' || 
        target.tagName.toLowerCase() === 'a' || 
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') !== null ||
        target.closest('button') !== null;
      
      setIsPointer(hasPointerCursor);
      
      // Handle luxury hover elements
      updateLuxuryElements(newPosition.x, newPosition.y);
      
      // Generate size and opacity based on movement speed
      const trailSize = 20 + (newSpeed * 0.5);
      const trailOpacity = Math.min(0.8, 0.3 + (newSpeed * 0.02));
      
      // Update trail with new position
      setTrail(prevTrail => {
        const newTrail = [
          { 
            ...newPosition, 
            id: Date.now(), 
            size: trailSize,
            opacity: trailOpacity
          },
          ...prevTrail.slice(0, maxTrailPoints - 1)
        ];
        return newTrail;
      });
    };
    
    const handleMouseDown = () => {
      setIsClicking(true);
    };
    
    const handleMouseUp = () => {
      setIsClicking(false);
    };
    
    const handleMouseLeave = () => {
      setIsHidden(true);
    };
    
    const handleMouseEnter = () => {
      setIsHidden(false);
    };
    
    // Setup interactive elements
    const setupInteractiveElements = () => {
      const interactiveElements = document.querySelectorAll('a, button, [role="button"], input, select, textarea');
      interactiveElements.forEach(el => {
        (el as HTMLElement).dataset.luxuryHover = "true";
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.body.addEventListener('mouseleave', handleMouseLeave);
    document.body.addEventListener('mouseenter', handleMouseEnter);
    
    // Set up interactive elements
    setupInteractiveElements();
    
    // Add resize listener to handle element repositioning
    window.addEventListener('resize', () => updateLuxuryElements(position.x, position.y));
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('resize', () => updateLuxuryElements(position.x, position.y));
    };
  }, [position.x, position.y, updateLuxuryElements]);
  
  // Hide default cursor
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      * {
        cursor: none !important;
      }
      .cursor-default, 
      [data-cursor="default"] {
        cursor: default !important;
      }
      input, textarea, select {
        cursor: text !important;
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  // Apply shimmer effect to luxury elements
  useEffect(() => {
    const luxuryElements = document.querySelectorAll('[data-luxury-hover="true"]');
    luxuryElements.forEach(el => {
      el.classList.add('luxury-shimmer-hover', 'luxury-outline');
    });
    
    return () => {
      luxuryElements.forEach(el => {
        el.classList.remove('luxury-shimmer-hover', 'luxury-outline');
      });
    };
  }, []);
  
  if (isHidden) return null;
  
  return (
    <div className="luxury-cursor pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Main cursor */}
      <motion.div
        className={cn(
          "cursor-main absolute rounded-full pointer-events-none",
          isPointer ? 
            "cursor-pointer w-10 h-10 border-2 border-primary/50 bg-transparent" : 
            "w-6 h-6 bg-primary/90"
        )}
        animate={{
          x: position.x,
          y: position.y,
          scale: isClicking ? 0.8 : isPointer ? 1.2 : 1,
          opacity: 1
        }}
        transition={{
          type: "spring",
          damping: 18,
          stiffness: 380,
          mass: 0.4
        }}
        style={{
          translateX: '-50%',
          translateY: '-50%',
        }}
      />
      
      {/* Glow effect */}
      <motion.div
        className="cursor-glow absolute rounded-full pointer-events-none"
        animate={{
          x: position.x,
          y: position.y,
          width: isPointer ? '80px' : `${60 + speed * 1.5}px`, 
          height: isPointer ? '80px' : `${60 + speed * 1.5}px`,
          opacity: isPointer ? 0.8 : 0.4 + (speed * 0.01),
          scale: isClicking ? 0.9 : 1
        }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 150,
          mass: 0.8
        }}
        style={{
          translateX: '-50%',
          translateY: '-50%',
        }}
      />
      
      {/* Outer ring only shown on hover */}
      {isPointer && (
        <motion.div
          className="absolute rounded-full border border-primary/30 pointer-events-none"
          animate={{
            x: position.x,
            y: position.y,
            width: '60px',
            height: '60px',
            opacity: 0.5,
            scale: isClicking ? 0.7 : 1.1,
          }}
          transition={{
            type: "spring",
            damping: 20,
            stiffness: 300,
            mass: 0.6
          }}
          style={{
            translateX: '-50%',
            translateY: '-50%',
            borderColor: 'hsla(43, 77%, 50%, 0.3)',
            boxShadow: '0 0 10px -2px hsla(43, 77%, 50%, 0.2)',
            animation: 'pulse-border 1.5s infinite ease-in-out'
          }}
        />
      )}
      
      {/* Trail effect */}
      <AnimatePresence>
        {trail.map((point, index) => (
          <motion.div
            key={point.id}
            className="cursor-trail-particle absolute rounded-full pointer-events-none"
            initial={{ opacity: point.opacity, scale: 1 }}
            animate={{
              opacity: Math.max(0.05, point.opacity - (index * 0.05)),
              scale: Math.max(0.2, 1 - (index * 0.06)),
              x: point.x,
              y: point.y,
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              translateX: '-50%',
              translateY: '-50%',
              width: `${Math.max(8, point.size - (index * 1.3))}px`,
              height: `${Math.max(8, point.size - (index * 1.3))}px`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}