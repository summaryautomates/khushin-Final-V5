import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { Suspense, useState } from 'react';

function Model({ url }: { url: string }) {
  const [error, setError] = useState<Error | null>(null);

  try {
    const { scene } = useGLTF(url);
    if (error) return null;

    return (
      <primitive 
        object={scene} 
        scale={[1.5, 1.5, 1.5]}
        position={[0, -1, 0]}
      />
    );
  } catch (err) {
    console.error('Error loading model:', err);
    setError(err as Error);
    return null;
  }
}

interface ModelViewerProps {
  modelUrl: string;
  className?: string;
}

export function ModelViewer({ modelUrl, className = "h-[500px]" }: ModelViewerProps) {
  return (
    <div className={`w-full ${className}`}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ background: '#111' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <spotLight
            position={[10, 10, 10]}
            angle={0.15}
            penumbra={1}
            intensity={1}
          />
          <Model url={modelUrl} />
          <OrbitControls
            autoRotate
            autoRotateSpeed={1}
            enableZoom={true}
            enablePan={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.5}
          />
          <Environment preset="studio" />
        </Suspense>
      </Canvas>
    </div>
  );
}