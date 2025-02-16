import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/products/product-grid";
import type { Product } from "@shared/schema";

export default function Home() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/20 via-black to-black" />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1] }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"
        />
        <div className="container relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-7xl md:text-8xl font-extralight tracking-tight mb-12">
              <span className="block">Make Your</span>
              <span className="block mt-2">Loved One Happy!</span>
            </h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="mt-8 text-xl md:text-2xl leading-relaxed text-zinc-400 max-w-2xl mx-auto tracking-wide"
            >
              Discover our curated collection of sophisticated designs
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="mt-16"
            >
              <Link href="/products" className="inline-block">
                <Button 
                  size="lg" 
                  className="text-lg px-12 py-8 bg-white/5 backdrop-blur-lg border border-white/10 text-white hover:bg-white/10 transition-all duration-300"
                >
                  View Collection
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-32 bg-zinc-950">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="container"
        >
          <h2 className="text-4xl md:text-5xl font-extralight text-center mb-24 text-white tracking-wider">
            Featured Pieces
          </h2>
          {isLoading ? (
            <div className="text-center text-zinc-400">Loading collection...</div>
          ) : (
            products && <ProductGrid products={products.slice(0, 4)} />
          )}
        </motion.div>
      </section>

      {/* Brand Statement */}
      <section className="py-32 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-black to-black" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="container relative z-10"
        >
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-extralight mb-12 tracking-wider">Heritage</h2>
            <p className="text-xl text-zinc-400 leading-relaxed tracking-wide">
              KHUSH.IN embodies the essence of modern luxury. 
              Each piece is thoughtfully crafted to elevate your lifestyle.
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}