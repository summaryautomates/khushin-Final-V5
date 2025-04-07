import { useEffect, useRef, useState, Suspense } from 'react';
import * as THREE from 'three';
import { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';
import { Loader2 } from 'lucide-react';

// Type definitions
export interface ModelViewerProps {
  modelUrl: string;
  fallbackUrl?: string;
  onError?: () => void;
  renderMethod?: 'drei' | 'legacy'; // Choose which rendering approach to use
  height?: number;
  autoRotate?: boolean;
  backgroundColor?: string;
}

interface LoadProgress {
  loaded: number;
  total: number;
}

// Internal component for React Three Fiber/Drei approach
function DreiModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

export function ModelViewer({ 
  modelUrl, 
  fallbackUrl, 
  onError,
  renderMethod = 'drei', // Default to modern approach
  height = 400,
  autoRotate = true,
  backgroundColor = '#000000'
}: ModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFallback, setShowFallback] = useState(false);

  // Modern approach using React Three Fiber and Drei
  if (renderMethod === 'drei') {
    return (
      <div className="relative w-full rounded-lg overflow-hidden" style={{ height: `${height}px`, backgroundColor }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
            <p className="text-red-500">{error}</p>
          </div>
        )}
        {showFallback && fallbackUrl ? (
          <img
            src={fallbackUrl}
            alt="Product"
            className="w-full h-full object-contain"
          />
        ) : (
          <Canvas 
            camera={{ position: [0, 0, 5], fov: 45 }}
            onCreated={() => setLoading(false)}
            onError={(e) => {
              console.error('Canvas error:', e);
              setError('Failed to load 3D viewer');
              setShowFallback(true);
              if (onError) onError();
            }}
          >
            <Suspense fallback={null}>
              <DreiModel url={modelUrl} />
              <OrbitControls 
                enableZoom={true}
                enablePan={true}
                enableRotate={true}
                autoRotate={autoRotate}
                autoRotateSpeed={1}
              />
              <Environment preset="warehouse" />
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
            </Suspense>
          </Canvas>
        )}
      </div>
    );
  }

  // Legacy approach using direct Three.js
  useEffect(() => {
    if (!containerRef.current || renderMethod !== 'legacy') return;

    let mounted = true;
    const container = containerRef.current;

    // Basic scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);

    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Add controls
    const controls = new ThreeOrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = autoRotate;

    // Load model
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf: GLTF) => {
        if (!mounted) return;

        scene.add(gltf.scene);

        // Center model
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        gltf.scene.position.sub(center);

        setLoading(false);
      },
      (progress: LoadProgress) => {
        if (!mounted) return;
        const percentage = (progress.loaded / progress.total * 100).toFixed(0);
        console.log('Loading progress:', percentage + '%');
      },
      (error: ErrorEvent) => {
        if (!mounted) return;
        console.error('Error loading model:', error);
        setError('Failed to load 3D model');
        setLoading(false);
        setShowFallback(true);
        if (onError) onError();
      }
    );

    // Animation loop
    let animationFrameId: number;
    function animate() {
      if (!mounted) return;
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Handle window resize
    function handleResize() {
      if (!container) return;

      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    }
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      mounted = false;
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
      // Safely dispose controls if the method exists
      if (typeof (controls as any).dispose === 'function') {
        (controls as any).dispose();
      }
    };
  }, [modelUrl, onError, renderMethod, autoRotate, backgroundColor]);

  if (renderMethod === 'legacy') {
    return (
      <div className="relative w-full rounded-lg overflow-hidden" style={{ height: `${height}px`, backgroundColor }}>
        <div ref={containerRef} className="w-full h-full" />
        
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        
        {error && !showFallback && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-red-500">{error}</div>
          </div>
        )}
        
        {showFallback && fallbackUrl && (
          <div className="absolute inset-0">
            <img
              src={fallbackUrl}
              alt="Product"
              className="w-full h-full object-contain"
            />
          </div>
        )}
      </div>
    );
  }

  // Default case (should never hit this with the if conditions above)
  return null;
}