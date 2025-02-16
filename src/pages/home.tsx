import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProductGrid from "@/components/products/product-grid";
import { Link } from "wouter";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Loader } from "@/components/ui/loader";

// Separate ThreeJS scene component for better organization
const ThreeScene = () => {
  return (
    <Canvas>
      <Suspense fallback={<Loader />}>
        <ambientLight intensity={0.5} />
        <mesh>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial 
            color="#F5B041" 
            metalness={0.8} 
            roughness={0.2} 
          />
        </mesh>
        <OrbitControls 
          enableZoom={false} 
          autoRotate 
          autoRotateSpeed={4}
        />
      </Suspense>
    </Canvas>
  );
};

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    setEmail("");
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto px-4 h-full flex items-center">
          <div className="w-1/2">
            <h1 className="text-5xl font-bold mb-6">Luxury Fashion Reimagined</h1>
            <p className="text-xl mb-8">Experience the fusion of tradition and innovation in every piece.</p>
            <div className="flex gap-4">
              <Link href="/products">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Explore Collection
                </Button>
              </Link>
              <Link href="/customize">
                <Button variant="outline" size="lg">
                  Customize Now
                </Button>
              </Link>
            </div>
          </div>
          <div className="w-1/2 h-full">
            <div className="relative h-full">
              <ThreeScene />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Collection</h2>
          <div className="max-w-xl mx-auto mb-12">
            <Input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <ProductGrid searchQuery={searchQuery} />
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Newsletter</h2>
          <p className="mb-8">Stay updated with our latest collections and exclusive offers.</p>
          <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex gap-4">
            <Input 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-grow" 
            />
            <Button type="submit">Subscribe</Button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default Home;