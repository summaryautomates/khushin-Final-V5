import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/products/product-grid";
import type { Product } from "@shared/schema";
import { Suspense } from "react";

function Scene() {
  return (
    <mesh>
      <sphereGeometry args={[1, 32, 32]} />
      <meshNormalMaterial />
    </mesh>
  );
}

function ThreeScene() {
  return (
    <div className="absolute inset-0 w-full h-full opacity-50">
      <Canvas>
        <Suspense fallback={null}>
          <Scene />
          <OrbitControls autoRotate enableZoom={false} />
          <ambientLight intensity={0.5} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default function Home() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-zinc-900 to-black text-white overflow-hidden">
        <div className="container relative">
          <ThreeScene />
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-4xl mx-auto text-center relative z-10"
          >
            <h1 className="text-7xl md:text-8xl font-extralight tracking-tight mb-12">
              Luxury Redefined
            </h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="mt-8 text-xl md:text-2xl leading-relaxed text-zinc-300 max-w-2xl mx-auto"
            >
              Discover extraordinary pieces that define elegance and sophistication
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="mt-16 flex items-center justify-center gap-x-8"
            >
              <Link href="/products" className="w-full md:w-auto">
                <Button size="lg" className="text-lg px-12 py-8 bg-white/10 backdrop-blur-lg border border-white/20 text-white hover:bg-white/20 transition-all duration-300 w-full md:w-auto">
                  Explore Collection
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-32 bg-gradient-to-b from-black to-zinc-900">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="container"
        >
          <h2 className="text-4xl md:text-5xl font-extralight text-center mb-24 text-white">
            Featured Collection
          </h2>
          {isLoading ? (
            <div className="text-center text-zinc-400">Loading collection...</div>
          ) : (
            products && <ProductGrid products={products.slice(0, 4)} />
          )}
        </motion.div>
      </section>

      {/* Brand Story */}
      <section className="py-32 bg-black text-white">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="container"
        >
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-extralight mb-12">Heritage</h2>
            <p className="text-xl text-zinc-300 leading-relaxed">
              KHUSH.IN crafts exceptional pieces that embody sophistication. 
              Each creation is a testament to our dedication to excellence.
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}