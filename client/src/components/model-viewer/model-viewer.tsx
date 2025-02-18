import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Stage } from "@react-three/drei";
import { Suspense } from "react";

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

interface ModelViewerProps {
  modelUrl: string;
}

export function ModelViewer({ modelUrl }: ModelViewerProps) {
  return (
    <div className="h-[400px] w-full">
      <Canvas shadows camera={{ position: [0, 0, 2.5], fov: 50 }}>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.5}>
            <Model url={modelUrl} />
          </Stage>
          <OrbitControls
            autoRotate
            autoRotateSpeed={4}
            enableZoom={true}
            makeDefault
            minPolarAngle={Math.PI / 2}
            maxPolarAngle={Math.PI / 2}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
