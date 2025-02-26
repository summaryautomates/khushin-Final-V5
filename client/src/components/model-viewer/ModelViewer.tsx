import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';
import { Suspense, useState } from 'react';
import { Loader2 } from 'lucide-react';

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

export function ModelViewer({ modelUrl }: { modelUrl: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="w-full h-[500px] relative rounded-lg overflow-hidden bg-zinc-900">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50 z-10">
          <p className="text-red-500">{error}</p>
        </div>
      )}
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 45 }}
        onCreated={() => setIsLoading(false)}
        onError={(error) => {
          console.error('Canvas error:', error);
          setError('Failed to load 3D viewer');
        }}
      >
        <Suspense fallback={null}>
          <Model url={modelUrl} />
          <OrbitControls 
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            autoRotate={true}
            autoRotateSpeed={1}
          />
          <Environment preset="warehouse" />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
        </Suspense>
      </Canvas>
    </div>
  );
}