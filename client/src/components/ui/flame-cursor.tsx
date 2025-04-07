import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import './flame-cursor.css';

interface Particle {
  id: number;
  size: number;
  duration: number;
  x: number;
  y: number;
  rotation: number;
  hue: number;
  opacity: number;
}

interface Trail {
  id: number;
  x: number;
  y: number;
  size: number;
}

interface Ember {
  id: number;
  x: number;
  y: number;
  xOffset: number;
  yOffset: number;
}

export const FlameCursor: React.FC = () => {
  // Cursor position with spring physics for smooth movement
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 300 };
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);

  // State for flame particles, trails, and interaction effects
  const [particles, setParticles] = useState<Particle[]>([]);
  const [trails, setTrails] = useState<Trail[]>([]);
  const [embers, setEmbers] = useState<Ember[]>([]);
  const [bursts, setBursts] = useState<{id: number, x: number, y: number}[]>([]);
  const [isClicking, setIsClicking] = useState(false);
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [isOverInteractive, setIsOverInteractive] = useState(false);
  
  // Refs for tracking motion and timers
  const velocityRef = useRef({ x: 0, y: 0 });
  const prevPositionRef = useRef({ x: 0, y: 0 });
  const lastParticleTimeRef = useRef(0);
  const lastTrailTimeRef = useRef(0);
  const lastEmberTimeRef = useRef(0);
  const particleIdCounterRef = useRef(0);
  const trailIdCounterRef = useRef(0);
  const emberIdCounterRef = useRef(0);
  const burstIdCounterRef = useRef(0);
  const frameIdRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);
  
  // Generate a new flame particle
  const createParticle = useCallback((x: number, y: number, forceCreate = false) => {
    const now = Date.now();
    const timeSinceLastParticle = now - lastParticleTimeRef.current;
    const speed = Math.sqrt(
      Math.pow(velocityRef.current.x, 2) + 
      Math.pow(velocityRef.current.y, 2)
    );
    
    // Adjust particle creation rate based on movement speed
    const particleInterval = isClicking ? 40 : Math.max(80 - speed * 5, 40);
    
    if (forceCreate || timeSinceLastParticle > particleInterval) {
      const baseSize = intensity === 'low' ? 12 : intensity === 'medium' ? 16 : 20;
      const sizeVariation = isClicking ? 1.5 : isOverInteractive ? 1.3 : 1;
      const size = baseSize * sizeVariation * (0.8 + Math.random() * 0.4);
      
      const hueBase = isOverInteractive ? 30 : 40;
      const hueVariation = isOverInteractive ? 15 : 10;
      const hue = hueBase - hueVariation + Math.random() * hueVariation * 2;
      
      const particle: Particle = {
        id: particleIdCounterRef.current++,
        size,
        duration: 0.8 + Math.random() * 0.4, // 0.8-1.2 seconds
        x,
        y,
        rotation: -20 + Math.random() * 40, // -20 to 20 degrees
        hue,
        opacity: 0.7 + Math.random() * 0.3, // 0.7-1.0 opacity
      };
      
      setParticles(prev => [...prev, particle]);
      lastParticleTimeRef.current = now;
      
      // Cleanup old particles to maintain performance
      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== particle.id));
      }, particle.duration * 1000);
    }
  }, [intensity, isClicking, isOverInteractive]);
  
  // Generate a trail effect behind the cursor
  const createTrail = useCallback((x: number, y: number) => {
    const now = Date.now();
    const speed = Math.sqrt(
      Math.pow(velocityRef.current.x, 2) + 
      Math.pow(velocityRef.current.y, 2)
    );
    
    // Only create trails when moving somewhat quickly
    if (speed > 0.2 && now - lastTrailTimeRef.current > 100) {
      const trail: Trail = {
        id: trailIdCounterRef.current++,
        x,
        y,
        size: 10 + speed * 2, // Size based on movement speed
      };
      
      setTrails(prev => [...prev, trail]);
      lastTrailTimeRef.current = now;
      
      // Cleanup old trails
      setTimeout(() => {
        setTrails(prev => prev.filter(t => t.id !== trail.id));
      }, 1000); // Trail lasts 1 second
    }
  }, []);
  
  // Create floating ember particles
  const createEmber = useCallback((x: number, y: number, count = 1) => {
    const now = Date.now();
    if (now - lastEmberTimeRef.current > 200 || count > 1) {
      const newEmbers: Ember[] = [];
      
      for (let i = 0; i < count; i++) {
        const ember: Ember = {
          id: emberIdCounterRef.current++,
          x,
          y,
          xOffset: -20 + Math.random() * 40, // Random x offset -20 to 20
          yOffset: 20 + Math.random() * 40,  // Random y offset 20 to 60 (upward)
        };
        newEmbers.push(ember);
      }
      
      setEmbers(prev => [...prev, ...newEmbers]);
      lastEmberTimeRef.current = now;
      
      // Cleanup old embers
      setTimeout(() => {
        setEmbers(prev => prev.filter(e => !newEmbers.some(ne => ne.id === e.id)));
      }, 1500); // Embers last 1.5 seconds
    }
  }, []);
  
  // Create a burst effect (e.g., when clicking)
  const createBurst = useCallback((x: number, y: number) => {
    const burst = { id: burstIdCounterRef.current++, x, y };
    setBursts(prev => [...prev, burst]);
    
    // Create multiple embers with the burst
    createEmber(x, y, 5);
    
    // Cleanup burst after animation
    setTimeout(() => {
      setBursts(prev => prev.filter(b => b.id !== burst.id));
    }, 600); // Burst lasts 0.6 seconds
  }, [createEmber]);
  
  // Check if the cursor is over an interactive element
  const checkForInteractiveElements = useCallback((x: number, y: number) => {
    // Get element under the cursor
    const element = document.elementFromPoint(x, y);
    if (!element) return;
    
    // Check if it's an interactive element
    const isInteractive = 
      element.tagName === 'A' || 
      element.tagName === 'BUTTON' ||
      element.closest('a') || 
      element.closest('button') ||
      element.getAttribute('role') === 'button' ||
      element.hasAttribute('data-flame-element') ||
      element.closest('[data-flame-element]');
    
    // If hovering over an interactive element, get its intensity
    if (isInteractive) {
      const flameElement = element.closest('[data-flame-element]');
      if (flameElement) {
        const elementIntensity = flameElement.getAttribute('data-flame-element') as 'low' | 'medium' | 'high';
        if (elementIntensity) {
          setIntensity(elementIntensity);
        }
      }
    }
    
    setIsOverInteractive(!!isInteractive);
  }, []);
  
  // Main animation loop using requestAnimationFrame
  const animateFlame = useCallback(() => {
    const mousePosX = cursorX.get();
    const mousePosY = cursorY.get();
    
    // Calculate velocity
    const deltaX = mousePosX - prevPositionRef.current.x;
    const deltaY = mousePosY - prevPositionRef.current.y;
    velocityRef.current = { 
      x: deltaX * 0.3 + velocityRef.current.x * 0.7, // Apply smoothing
      y: deltaY * 0.3 + velocityRef.current.y * 0.7 
    };
    prevPositionRef.current = { x: mousePosX, y: mousePosY };
    
    // Check for interactive elements
    checkForInteractiveElements(mousePosX, mousePosY);
    
    // Create flame particles
    createParticle(mousePosX, mousePosY);
    
    // Create trails based on movement
    createTrail(mousePosX, mousePosY);
    
    // Occasionally create embers when moving
    const speed = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
    if (speed > 1 && Math.random() < 0.1) {
      createEmber(mousePosX, mousePosY);
    }
    
    // Continue animation loop
    frameIdRef.current = requestAnimationFrame(animateFlame);
  }, [cursorX, cursorY, createParticle, createTrail, createEmber, checkForInteractiveElements]);
  
  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      
      // Initialize animation on first mouse move
      if (!isInitializedRef.current) {
        prevPositionRef.current = { x: e.clientX, y: e.clientY };
        isInitializedRef.current = true;
        animateFlame();
      }
    };
    
    const handleMouseDown = (e: MouseEvent) => {
      setIsClicking(true);
      createBurst(e.clientX, e.clientY);
      
      // Create extra particles on click
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          createParticle(e.clientX, e.clientY, true);
        }, i * 30);
      }
    };
    
    const handleMouseUp = () => {
      setIsClicking(false);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, [animateFlame, createBurst, createParticle, cursorX, cursorY]);
  
  // Render flame cursor elements
  return (
    <div className="flame-cursor-container">
      {/* Main cursor position */}
      <motion.div 
        className={`flame-cursor ${isOverInteractive ? 'interactive-element-hover' : ''} flame-intensity-${intensity}`}
        style={{ 
          x: springX, 
          y: springY,
        }}
      />
      
      {/* Flame particles */}
      {particles.map(particle => (
        <div
          key={`particle-${particle.id}`}
          className="flame-particle"
          style={{
            left: particle.x + 'px',
            top: particle.y + 'px',
            width: particle.size + 'px',
            height: particle.size * 1.5 + 'px',
            animationDuration: particle.duration + 's',
            opacity: particle.opacity,
            filter: `hue-rotate(${particle.hue}deg)`,
            ['--rotation' as any]: `${particle.rotation}deg`,
          }}
        />
      ))}
      
      {/* Trail effects */}
      {trails.map(trail => (
        <div
          key={`trail-${trail.id}`}
          className="flame-trail"
          style={{
            left: trail.x + 'px',
            top: trail.y + 'px',
            width: trail.size + 'px',
            height: trail.size + 'px',
          }}
        />
      ))}
      
      {/* Click bursts */}
      {bursts.map(burst => (
        <div
          key={`burst-${burst.id}`}
          className="flame-burst"
          style={{
            left: burst.x + 'px',
            top: burst.y + 'px',
          }}
        />
      ))}
      
      {/* Flying embers */}
      {embers.map(ember => (
        <div
          key={`ember-${ember.id}`}
          className="flame-ember"
          style={{
            left: ember.x + 'px',
            top: ember.y + 'px',
            ['--x-offset' as any]: `${ember.xOffset}px`,
            ['--y-offset' as any]: `${ember.yOffset}px`,
          }}
        />
      ))}
    </div>
  );
};