import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/products/product-grid";
import type { Product } from "@shared/schema";

export default function Home() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.98]);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.5 }}
            transition={{ duration: 1.5 }}
          >
            <img 
              src="https://images.unsplash.com/photo-1586227740560-8cf2732c1531?q=80&w=2661&auto=format"
              className="w-full h-full object-cover"
              alt="Hero background"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.05, 0.1] }}
          transition={{ duration: 2, times: [0, 0.5, 1] }}
          className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"
        />

        <motion.div 
          style={{ opacity, scale }}
          className="container relative z-10"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.h1 
              initial={{ letterSpacing: "0.2em", opacity: 0 }}
              animate={{ letterSpacing: "0.1em", opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.8 }}
              className="text-7xl md:text-8xl font-extralight mb-12 tracking-wider"
            >
              <span className="block">Make Your</span>
              <span className="block mt-2">Loved One Happy!</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="mt-8 text-xl md:text-2xl leading-relaxed text-zinc-400 max-w-2xl mx-auto tracking-wide"
            >
              Exclusive luxury lighters - The perfect gift to light up their smile.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="mt-16"
            >
              <Link href="/products">
                <Button 
                  size="lg" 
                  className="text-lg px-12 py-8 bg-white/5 backdrop-blur-lg border border-white/10 text-white hover:bg-white/10 transition-all duration-500 hover:scale-105"
                >
                  Explore Collection
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Products */}
      <section className="py-32 bg-zinc-950">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="container"
        >
          <motion.h2 
            initial={{ letterSpacing: "0.3em", opacity: 0 }}
            whileInView={{ letterSpacing: "0.2em", opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-extralight text-center mb-24 text-white tracking-wider"
          >
            Featured Pieces
          </motion.h2>

          {isLoading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-zinc-400"
            >
              Loading collection...
            </motion.div>
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
          viewport={{ once: true }}
          className="container relative z-10"
        >
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2 
              initial={{ letterSpacing: "0.3em", opacity: 0 }}
              whileInView={{ letterSpacing: "0.2em", opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-extralight mb-12 tracking-wider"
            >
              Heritage
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              viewport={{ once: true }}
              className="text-xl text-zinc-400 leading-relaxed tracking-wide"
            >
              KHUSH.IN embodies the essence of modern luxury. 
              Each piece is thoughtfully crafted to elevate your lifestyle.
            </motion.p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}