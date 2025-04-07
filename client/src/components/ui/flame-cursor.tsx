import React, { useEffect, useState, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import './flame-cursor.css';

interface Particle {
  id: number;
  x: number;
  y: number;
  opacity: number;
  scale: number;
  rotation: number;
  hue: number;
  life: number;
  maxLife: number;
  speedX: number;
  speedY: number;
  sparkle: boolean;
  delay: number;
  glowIntensity: number;
}

export function FlameCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);
  const [particleCounter, setParticleCounter] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [mouseSpeed, setMouseSpeed] = useState(0);
  const prevPositionRef = useRef({ x: 0, y: 0, time: Date.now() });
  const animationFrameRef = useRef<number | null>(null);
  const controls = useAnimation();

  // Function to handle mouse movement
  const handleMouseMove = (e: MouseEvent) => {
    // Calculate mouse speed
    const currentTime = Date.now();
    const timeDelta = currentTime - prevPositionRef.current.time;
    
    // Skip if time delta is too small to avoid division by zero
    if (timeDelta > 0) {
      const xDelta = Math.abs(e.clientX - prevPositionRef.current.x);
      const yDelta = Math.abs(e.clientY - prevPositionRef.current.y);
      const distance = Math.sqrt(xDelta * xDelta + yDelta * yDelta);
      const newSpeed = distance / timeDelta * 20; // Adjust multiplier for sensitivity
      setMouseSpeed(Math.min(newSpeed, 10)); // Cap speed value
    }
    
    // Update previous position reference
    prevPositionRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: currentTime
    };
    
    setMousePosition({ x: e.clientX, y: e.clientY });
    setIsVisible(true);
  };

  // Handle mouse events
  const handleMouseDown = () => setIsClicking(true);
  const handleMouseUp = () => setIsClicking(false);
  const handleMouseLeave = () => setIsVisible(false);
  const handleMouseEnter = () => setIsVisible(true);

  // Check for interactive elements
  const checkInteractiveElements = (e: MouseEvent) => {
    const element = document.elementFromPoint(e.clientX, e.clientY);
    const isInteractive = 
      element?.tagName === 'BUTTON' || 
      element?.tagName === 'A' || 
      element?.tagName === 'INPUT' ||
      element?.hasAttribute('data-flame-element') ||
      element?.closest('button') || 
      element?.closest('a') || 
      element?.closest('[data-flame-element]');
    
    setIsHoveringInteractive(!!isInteractive);
  };

  // Initialize event listeners
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousemove', checkInteractiveElements);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    
    controls.start({ opacity: 1, scale: 1 });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousemove', checkInteractiveElements);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      
      // Clean up animation frame
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [controls]);

  // Function to generate new particles
  const generateParticles = () => {
    // Determine how many particles to create based on mouse speed
    const baseCount = isClicking ? 5 : 2;
    const speedFactor = Math.floor(mouseSpeed * 1.2); // Enhanced for luxury feel
    const particleCount = isHoveringInteractive 
      ? baseCount + speedFactor + 3
      : baseCount + speedFactor;
    
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      // Create more elegant variation in particle position
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 20 * (isClicking ? 1.5 : 1);
      const offsetX = Math.cos(angle) * distance;
      const offsetY = Math.sin(angle) * distance - 12; // More upward bias for rising flame effect
      
      // Adjust life for more sustained flame effect
      const maxLife = isHoveringInteractive 
        ? 60 + Math.random() * 40
        : 40 + Math.random() * 30;
        
      // Enhanced scale factor for more impressive particles
      const scaleFactor = isHoveringInteractive 
        ? 0.6 + (mouseSpeed * 0.15)
        : 0.4 + (mouseSpeed * 0.1);
      
      // More gold/amber hues for a luxurious appearance
      const hueBase = isHoveringInteractive ? 35 : 25; // Slightly more golden
      const hueVariation = isHoveringInteractive ? 25 : 15;
      
      // Random sparkle effect for some particles (more common when clicking/hovering)
      const sparkleChance = isClicking ? 0.4 : (isHoveringInteractive ? 0.25 : 0.15);
      const hasSparkle = Math.random() < sparkleChance;
      
      // Varied glow intensity for depth
      const glowIntensity = isHoveringInteractive 
        ? 0.7 + Math.random() * 0.3
        : 0.5 + Math.random() * 0.3;
      
      // Delay some particles for cascading effect
      const delay = Math.floor(Math.random() * 5);
      
      newParticles.push({
        id: particleCounter + i,
        x: mousePosition.x + offsetX,
        y: mousePosition.y + offsetY,
        opacity: 0.75 + Math.random() * 0.25, // Higher base opacity
        scale: scaleFactor * (0.6 + Math.random() * 0.8),
        rotation: Math.random() * 360,
        hue: hueBase + Math.random() * hueVariation,
        life: maxLife,
        maxLife,
        speedX: (Math.random() - 0.5) * 3 * (isHoveringInteractive ? 1.8 : 1.2),
        speedY: -1.8 - Math.random() * 2.5 * (isHoveringInteractive ? 1.8 : 1.2),
        sparkle: hasSparkle,
        delay: delay,
        glowIntensity: glowIntensity
      });
    }
    
    // Special gold sparkles when clicking or hovering interactive elements
    if (isClicking || isHoveringInteractive) {
      const sparkleCount = isClicking ? 3 : 1;
      for (let i = 0; i < sparkleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 5 + Math.random() * 15;
        
        newParticles.push({
          id: particleCounter + particleCount + i,
          x: mousePosition.x + Math.cos(angle) * distance,
          y: mousePosition.y + Math.sin(angle) * distance - 5,
          opacity: 0.9,
          scale: 0.3 + Math.random() * 0.4,
          rotation: Math.random() * 360,
          hue: 40 + Math.random() * 10, // More golden
          life: 20 + Math.random() * 15,
          maxLife: 20 + Math.random() * 15,
          speedX: Math.cos(angle) * (1 + Math.random() * 2),
          speedY: Math.sin(angle) * (1 + Math.random() * 2) - 2,
          sparkle: true,
          delay: 0,
          glowIntensity: 0.9 + Math.random() * 0.1
        });
      }
      
      setParticleCounter(prevCounter => prevCounter + particleCount + sparkleCount);
    } else {
      setParticleCounter(prevCounter => prevCounter + particleCount);
    }
    
    return newParticles;
  };

  // Main animation loop
  useEffect(() => {
    const animateParticles = () => {
      // Add new particles
      let newParticles = [...particles];
      
      if (isVisible) {
        newParticles = [...newParticles, ...generateParticles()];
      }
      
      // Update existing particles
      newParticles = newParticles
        .map(particle => {
          // Apply delay before starting animation
          if (particle.delay > 0) {
            return {
              ...particle,
              delay: particle.delay - 1
            };
          }
          
          // Calculate life-based properties
          const lifeRatio = particle.life / particle.maxLife;
          let particleOpacity = lifeRatio * 0.8;
          
          // Sparkle effect for gold particles
          if (particle.sparkle) {
            // Pulsating opacity for sparkle effect
            const sparklePhase = Math.sin(particle.life * 0.4) * 0.2 + 0.8;
            particleOpacity *= sparklePhase;
          }
          
          // Apply sophisticated movement patterns
          const speedX = particle.speedX * 0.98;
          const speedY = particle.speedY * 0.98;
          
          // For sparkles, add gentle oscillation
          const wiggleX = particle.sparkle ? (Math.sin(particle.life * 0.2) * 0.5) : 0;
          const wiggleY = particle.sparkle ? (Math.cos(particle.life * 0.2) * 0.3) : 0;
          
          // Update particle properties for animation
          return {
            ...particle,
            x: particle.x + speedX + wiggleX,
            y: particle.y + speedY + wiggleY,
            opacity: particleOpacity, 
            scale: particle.scale * (lifeRatio * 0.8 + 0.2), // Smoother scaling
            rotation: particle.rotation + (Math.random() - 0.5) * (particle.sparkle ? 8 : 5),
            life: particle.life - 1,
            // Gradually shift hue - golden particles shift less
            hue: particle.hue + (particle.sparkle ? 0.1 : 0.3),
            // Slow down as they rise
            speedY: speedY,
            speedX: speedX,
            // Glow intensity fades with life
            glowIntensity: particle.glowIntensity * (0.5 + lifeRatio * 0.5)
          };
        })
        .filter(particle => particle.life > 0);
      
      setParticles(newParticles);
      animationFrameRef.current = requestAnimationFrame(animateParticles);
    };
    
    animationFrameRef.current = requestAnimationFrame(animateParticles);
    
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isVisible, particles, mousePosition, isClicking, isHoveringInteractive, mouseSpeed]);

  // Conditional classes for cursor styles
  const getCursorClassName = () => {
    if (isClicking) return 'flame-cursor-clicking';
    if (isHoveringInteractive) return 'flame-cursor-interactive';
    return '';
  };

  return (
    <>
      {/* Main cursor */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`flame-cursor ${getCursorClassName()}`}
            style={{
              left: mousePosition.x,
              top: mousePosition.y,
              pointerEvents: 'none',
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={controls}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.15 }}
          />
        )}
      </AnimatePresence>
      
      {/* Particle container */}
      <div className="flame-particles-container">
        {particles.map(particle => {
          // Skip particles that are still in delay mode
          if (particle.delay > 0) return null;
          
          // Determine CSS class based on particle properties
          const particleClass = particle.sparkle 
            ? "flame-particle flame-particle-sparkle" 
            : "flame-particle";
          
          // Glow filter based on intensity and sparkle status
          const glowFilter = particle.sparkle
            ? `drop-shadow(0 0 ${particle.glowIntensity * 2}px rgba(255, 223, 0, 0.8))`
            : `drop-shadow(0 0 ${particle.glowIntensity}px rgba(255, 165, 0, 0.6))`;
            
          return (
            <div
              key={particle.id}
              className={particleClass}
              style={{
                left: particle.x,
                top: particle.y,
                opacity: particle.opacity,
                transform: `scale(${particle.scale}) rotate(${particle.rotation}deg)`,
                filter: `hue-rotate(${particle.hue}deg) ${glowFilter}`,
                pointerEvents: 'none',
                // Apply more intense glow effect for sparkle particles
                boxShadow: particle.sparkle 
                  ? `0 0 ${particle.glowIntensity * 3}px ${particle.glowIntensity * 1.5}px rgba(255, 223, 0, 0.6)` 
                  : undefined
              }}
            />
          );
        })}
      </div>
    </>
  );
}