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
    const baseCount = isClicking ? 3 : 1;
    const speedFactor = Math.floor(mouseSpeed);
    const particleCount = isHoveringInteractive 
      ? baseCount + speedFactor + 2 
      : baseCount + speedFactor;
    
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      // Create variation in particle position relative to cursor
      const offsetX = (Math.random() - 0.5) * 20;
      const offsetY = (Math.random() - 0.5) * 20 - 10; // Bias upward
      
      // Adjust life based on interactive state
      const maxLife = isHoveringInteractive 
        ? 50 + Math.random() * 30 
        : 30 + Math.random() * 20;
        
      // Scale factor increases with mouse speed and when hovering interactive elements
      const scaleFactor = isHoveringInteractive 
        ? 0.5 + (mouseSpeed * 0.1) 
        : 0.3 + (mouseSpeed * 0.07);
      
      // Add varied colors based on interactive state
      const hueBase = isHoveringInteractive ? 30 : 20;
      const hueVariation = isHoveringInteractive ? 20 : 10;
      
      newParticles.push({
        id: particleCounter + i,
        x: mousePosition.x + offsetX,
        y: mousePosition.y + offsetY,
        opacity: 0.7 + Math.random() * 0.3,
        scale: scaleFactor * (0.5 + Math.random() * 0.8),
        rotation: Math.random() * 360,
        hue: hueBase + Math.random() * hueVariation,
        life: maxLife,
        maxLife,
        speedX: (Math.random() - 0.5) * 2.5 * (isHoveringInteractive ? 1.5 : 1),
        speedY: -1.5 - Math.random() * 2 * (isHoveringInteractive ? 1.5 : 1),
      });
    }
    
    setParticleCounter(prevCounter => prevCounter + particleCount);
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
          // Update particle properties for animation
          return {
            ...particle,
            x: particle.x + particle.speedX,
            y: particle.y + particle.speedY,
            opacity: (particle.life / particle.maxLife) * 0.8,
            scale: particle.scale * (particle.life / particle.maxLife),
            rotation: particle.rotation + (Math.random() - 0.5) * 5,
            life: particle.life - 1,
            // Gradually shift hue
            hue: particle.hue + 0.2,
            // Slow down as they rise
            speedY: particle.speedY * 0.98,
            speedX: particle.speedX * 0.98,
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
        {particles.map(particle => (
          <div
            key={particle.id}
            className="flame-particle"
            style={{
              left: particle.x,
              top: particle.y,
              opacity: particle.opacity,
              transform: `scale(${particle.scale}) rotate(${particle.rotation}deg)`,
              filter: `hue-rotate(${particle.hue}deg)`,
              pointerEvents: 'none',
            }}
          />
        ))}
      </div>
    </>
  );
}