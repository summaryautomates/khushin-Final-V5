import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/products/product-grid";
import type { Product } from "@shared/schema";
import { Input } from "@/components/ui/input";
import {
  Heart,
  Search,
  Gift,
  Star,
  Clock,
  DollarSign,
  Filter,
  Sparkles,
  ShieldCheck,
  Truck,
  CreditCard,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Lock,
  Award,
  Smile,
  ThumbsUp,
  Users,
  Calendar
} from "lucide-react";
import { useState } from "react";


export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.98]);

  const handleBookExperience = () => {
    setLocation('/event-organizer');
  };

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
              <div className="flex flex-col gap-4 items-center">
                <div className="flex gap-2">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search our luxury collection..."
                    className="border-primary/20 rounded-full flex-grow w-[180px]"
                  />
                  <Button variant="secondary" className="rounded-full">
                    <Search className="w-4 h-4 rounded-full" />
                  </Button>
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                  className="flex flex-wrap justify-center gap-4"
                >

                  <Button variant="outline" size="sm" className="gap-2 mt-3 rounded-full">
                    <Star className="w-4 h-4" /> Premium Collection
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 mt-3 rounded-full">
                    <Clock className="w-4 h-4" /> Express Delivery
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 mt-3 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={handleBookExperience}
                  >
                    <Calendar className="w-4 h-4" /> Book Experience
                  </Button>
                </motion.div>
              </div>
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
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-primary/10 rounded-2xl p-8 md:p-12 border border-primary/20"
          >
            <Clock className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Express Delivery Available
            </h2>
            <p className="text-muted-foreground mb-6">
              Premium same-day delivery service for last-minute luxury gifts
            </p>
            <Button size="lg" className="bg-primary/90 hover:bg-primary rounded-full">
              Browse Instant Gifts
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}