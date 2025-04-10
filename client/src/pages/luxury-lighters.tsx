import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Crown, 
  Diamond, 
  Flame, 
  Award, 
  Sparkles, 
  RefreshCcw,
  Star,
  ChevronRight
} from "lucide-react";
import type { Product } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/products/product-card";
import { LuxuryButton } from "@/components/ui/luxury-button";
import { Link } from "wouter";

export default function LuxuryLighters() {
  // Fetch all products
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Filter for luxury lighter products
  const luxuryLighters = products?.filter(product => 
    product.collection === "luxury" && 
    product.category === "lighters"
  ) || [];

  // For feature highlighting
  const [activeFeature, setActiveFeature] = useState(0);
  const features = [
    { 
      icon: <Diamond className="h-6 w-6 text-gold" />, 
      title: "Premium Materials", 
      description: "Crafted from the finest materials including precious metals and rare woods."
    },
    { 
      icon: <Flame className="h-6 w-6 text-gold" />, 
      title: "Perfect Flame", 
      description: "Engineered for a consistent, wind-resistant flame in any environment."
    },
    { 
      icon: <Award className="h-6 w-6 text-gold" />, 
      title: "Lifetime Warranty", 
      description: "Each luxury lighter comes with our exclusive lifetime warranty."
    },
    { 
      icon: <RefreshCcw className="h-6 w-6 text-gold" />, 
      title: "Refillable Design", 
      description: "Sustainable, refillable design ensures your lighter lasts a lifetime."
    },
  ];

  // Rotate through features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16 relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-800 p-8 md:p-16"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url('/LL.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-transparent to-black/40" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <div className="h-px w-12 bg-gold/60"></div>
            <Crown className="h-10 w-10 text-gold" />
            <div className="h-px w-12 bg-gold/60"></div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-5xl md:text-6xl font-light tracking-wider text-white mb-6"
          >
            Luxury Lighters Collection
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-zinc-300 leading-relaxed mb-10 text-lg max-w-2xl mx-auto"
          >
            Discover our exquisite collection of premium lighters, each piece a testament to unparalleled craftsmanship
            and timeless elegance. From limited editions to bespoke designs, find your perfect companion of sophistication.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-4"
          >
            {features.map((feature, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className={`bg-gold/10 text-gold border-gold/20 px-4 py-2 text-sm transition-all duration-300 ${
                  activeFeature === index ? 'scale-110 border-gold/40' : ''
                }`}
              >
                {feature.icon}
                <span className="ml-2">{feature.title}</span>
              </Badge>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Featured Luxury Lighter */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="mb-20"
      >
        <div className="relative z-10">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-light tracking-wider text-white mb-4">
              Current Feature
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto"></div>
          </div>

          <div className="flex flex-col md:flex-row gap-10 p-8 bg-gradient-to-br from-zinc-900/80 to-black/80 rounded-2xl border border-zinc-800/50">
            {/* Feature Highlight */}
            <motion.div 
              className="flex-1 space-y-6"
              animate={{ opacity: 1 }}
              initial={{ opacity: 0 }}
              key={activeFeature}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3">
                {features[activeFeature].icon}
                <h3 className="text-2xl font-light text-white tracking-wider">{features[activeFeature].title}</h3>
              </div>
              <p className="text-zinc-300 leading-relaxed">
                {features[activeFeature].description}
              </p>
              <div className="pt-4 flex justify-start">
                <div className="flex space-x-1">
                  {features.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveFeature(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        activeFeature === index ? 'bg-gold w-6' : 'bg-zinc-700'
                      }`}
                      aria-label={`View feature ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Video or image showcase */}
            <div className="flex-1 flex items-center justify-center">
              <div className="relative aspect-video w-full max-w-md rounded-xl overflow-hidden border border-zinc-800/50">
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/50 to-black/50"></div>
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster="/products/luxury-lighters-poster.jpg"
                >
                  <source src="/products/luxury-lighter-flame.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="h-12 w-12 text-gold/80" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Product Grid Section */}
      <div className="mb-16">
        <div className="mb-10 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-light tracking-wider text-white mb-4"
          >
            Discover the Collection
          </motion.h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto"></div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-[300px] w-full rounded-xl" />
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-10 w-[150px]" />
                </div>
              ))}
          </div>
        ) : luxuryLighters.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {luxuryLighters.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12 bg-gradient-to-br from-zinc-900/80 to-black/80 rounded-2xl border border-zinc-800/50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Badge className="bg-gold/10 text-gold border-gold/20 mb-4">Coming Soon</Badge>
              <p className="text-muted-foreground">
                Our luxury lighters collection is currently being curated. Check back soon for exquisite new additions.
              </p>
            </motion.div>
          </div>
        )}
      </div>

      {/* Craftsmanship Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mb-20 p-10 bg-gradient-to-br from-zinc-900/80 to-black/80 rounded-2xl border border-zinc-800/50"
      >
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1">
            <h2 className="text-3xl font-light tracking-wider text-white mb-6">Unparalleled Craftsmanship</h2>
            <div className="space-y-6 text-zinc-300">
              <p>
                Every KHUSHIN luxury lighter represents the pinnacle of design and engineering. Our master craftsmen 
                meticulously handcraft each piece, ensuring perfection in every detail.
              </p>
              <p>
                From the selection of premium materials to the final finishing touches, we maintain 
                the highest standards of quality and precision that define true luxury.
              </p>
            </div>
            <div className="mt-8">
              <Link href="/customize">
                <LuxuryButton>
                  Explore Customization <ChevronRight className="h-4 w-4 ml-1" />
                </LuxuryButton>
              </Link>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="relative aspect-square w-full max-w-sm rounded-xl overflow-hidden bg-gradient-to-br from-zinc-900 to-black">
              <div className="absolute inset-0 flex items-center justify-center p-10">
                <img 
                  src="/products/craftsmanship.jpg" 
                  alt="Luxury lighter craftsmanship" 
                  className="w-full h-full object-cover rounded-lg opacity-80" 
                />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/70"></div>
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <div className="flex justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-gold" fill="#daa520" />
                    ))}
                  </div>
                  <p className="text-white text-sm font-light tracking-wider">Handcrafted Excellence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Call to Action */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="text-center py-10"
      >
        <h2 className="text-3xl font-light tracking-wider text-white mb-6">
          Experience Luxury Today
        </h2>
        <p className="text-zinc-300 mb-8 max-w-2xl mx-auto">
          Our luxury lighters are more than accessories—they're heirlooms designed to be passed down 
          through generations. Join the world of KHUSHIN luxury.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/products/category/lighters">
            <LuxuryButton>
              Browse All Lighters
            </LuxuryButton>
          </Link>
          <Link href="/premium-collection">
            <LuxuryButton variant="secondary">
              Premium Collection
            </LuxuryButton>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}