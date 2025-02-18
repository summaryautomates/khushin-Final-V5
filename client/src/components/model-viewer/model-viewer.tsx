import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface ModelViewerProps {
  modelUrl: string;
}

export function ModelViewer({ modelUrl }: ModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let mounted = true;
    console.log('Initializing 3D viewer with model URL:', modelUrl);

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45, // Reduced FOV for better focus
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);

    // Renderer setup with error handling
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
      renderer.outputEncoding = THREE.sRGBEncoding;
      containerRef.current.appendChild(renderer.domElement);
    } catch (err) {
      console.error('Failed to initialize WebGL renderer:', err);
      setError('Could not initialize 3D viewer. Please check if your browser supports WebGL.');
      return;
    }

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1;
    controls.enablePan = false;
    controls.minDistance = 3;
    controls.maxDistance = 10;

    // Model loading
    const loader = new GLTFLoader();

    console.log('Loading 3D model from:', modelUrl);
    setLoading(true);

    loader.load(
      modelUrl,
      (gltf) => {
        if (!mounted) return;

        console.log('Model loaded successfully');
        scene.add(gltf.scene);

        // Center and scale model
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        gltf.scene.position.sub(center);

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        gltf.scene.scale.multiplyScalar(scale);

        // Reset camera position for optimal view
        camera.position.set(0, 0, 5);
        controls.update();

        setLoading(false);
      },
      (progress) => {
        if (!mounted) return;
        console.log(`Loading progress: ${(progress.loaded / progress.total * 100).toFixed(2)}%`);
      },
      (error) => {
        if (!mounted) return;
        console.error('Error loading model:', error);
        setError('Failed to load 3D model. Please try again later.');
        setLoading(false);
      }
    );

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      if (!mounted) return;

      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !mounted) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      mounted = false;
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      if (containerRef.current && renderer) {
        containerRef.current.removeChild(renderer.domElement);
        renderer.dispose();
      }

      // Dispose of geometries and materials
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (object.material instanceof THREE.Material) {
            object.material.dispose();
          }
        }
      });
    };
  }, [modelUrl]);

  if (error) {
    return (
      <div className="h-[400px] w-full rounded-lg overflow-hidden bg-zinc-900 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-[400px] w-full rounded-lg overflow-hidden bg-zinc-900 flex items-center justify-center">
        <p className="text-zinc-400">Loading 3D model...</p>
      </div>
    );
  }

  return <div ref={containerRef} className="h-[400px] w-full rounded-lg overflow-hidden" />;
}