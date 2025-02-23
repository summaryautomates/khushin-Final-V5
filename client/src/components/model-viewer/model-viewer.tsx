import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

interface ModelViewerProps {
  modelUrl: string;
}

interface LoadProgress {
  loaded: number;
  total: number;
}

export function ModelViewer({ modelUrl }: ModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    let mounted = true;
    const container = containerRef.current;

    // Basic scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

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
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;

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
      // Safely dispose controls if the method exists
      if (typeof (controls as any).dispose === 'function') {
        (controls as any).dispose();
      }
    };
  }, [modelUrl]);

  return (
    <div className="relative h-[400px] w-full rounded-lg overflow-hidden bg-zinc-900">
      <div ref={containerRef} className="w-full h-full" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white">Loading model...</div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-red-500">{error}</div>
        </div>
      )}
    </div>
  );
}