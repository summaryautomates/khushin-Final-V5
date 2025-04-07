import React, { useRef, useEffect, Suspense, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Box, Sphere } from '@react-three/drei';
import { Group } from 'three';

// Simple luxury product model (Box with decorative elements)
function LuxuryBox({ scale = 1, position = [0, 0, 0], rotation = [0, 0, 0] }: { 
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
  const boxRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  
  // Animate the box
  useFrame(({ clock }) => {
    if (boxRef.current) {
      // Gentle rotation animation
      boxRef.current.rotation.y = rotation[1] + Math.sin(clock.getElapsedTime() * 0.2) * 0.1;
      boxRef.current.rotation.x = rotation[0] + Math.sin(clock.getElapsedTime() * 0.1) * 0.05;
    }
  });
  
  return (
    <group 
      ref={boxRef} 
      position={position} 
      rotation={rotation}
      scale={scale * 0.7}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Luxury box model */}
      <Box 
        args={[1, 0.5, 0.8]}
        receiveShadow
        castShadow
        scale={hovered ? 1.05 : 1}
      >
        <meshStandardMaterial 
          color="#d4af37" 
          metalness={1} 
          roughness={0.1} 
          envMapIntensity={1}
        />
      </Box>
      
      {/* Decorative elements */}
      <Sphere
        args={[0.1, 16, 16]}
        position={[0, 0.3, 0]}
      >
        <meshStandardMaterial 
          color="#ffffff" 
          metalness={0.8} 
          roughness={0.2}
        />
      </Sphere>
    </group>
  );
}

// Component to render 3D model - using simpler approach due to GLTF loading issues
function Model({ path, scale = 1, position = [0, 0, 0], rotation = [0, 0, 0] }: { 
  path: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
  // We'll just use our LuxuryBox component for now
  return <LuxuryBox scale={scale} position={position} rotation={rotation} />;
}

// Main Scene container component
export function Scene3D({ 
  children, 
  className = "",
  environmentPreset = "warehouse", // Options: "sunset", "dawn", "night", "warehouse", "forest", "apartment", "studio", "city", "park", "lobby"
}: { 
  children: React.ReactNode;
  className?: string;
  environmentPreset?: string;
}) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        shadows
        camera={{ position: [0, 0, 5], fov: 40 }}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
      >
        {/* Environment lighting */}
        <Environment preset={environmentPreset as any} />
        
        {/* Ambient lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1} 
          castShadow 
          shadow-mapSize-width={1024} 
          shadow-mapSize-height={1024}
        />
        
        {/* Orbital camera controls */}
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          minDistance={2}
          maxDistance={10}
          autoRotate={false}
          autoRotateSpeed={0.5}
        />
        
        {/* Ground shadow effect */}
        <ContactShadows 
          opacity={0.4} 
          scale={10} 
          blur={2} 
          far={10} 
          resolution={256} 
          color="#000000" 
          position={[0, -1, 0]}
        />
        
        {/* Render passed children */}
        {children}
      </Canvas>
    </div>
  );
}

// Interactive product component for simpler integration
export function InteractiveProduct3D({
  path,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0]
}: {
  path: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <Model
      path={path}
      scale={scale}
      position={position}
      rotation={rotation}
    />
  );
}

// No longer using external models - using local components instead