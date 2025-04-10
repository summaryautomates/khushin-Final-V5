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
  ChevronRight,
  ShoppingCart,
  ArrowRight
} from "lucide-react";
import type { Product } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/products/product-card";
import { LuxuryButton } from "@/components/ui/luxury-button";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/products";

export default function LuxuryLighters() {
  // Navigation
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { addItem } = useCart();
  const [loadingStates, setLoadingStates] = useState<{[key: number]: boolean}>({});

  // Quick buy function
  const handleQuickBuy = async (product: Product) => {
    setLoadingStates(prev => ({...prev, [product.id]: true}));
    try {
      await addItem(product);
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
      });
      // Navigate to cart page immediately
      setLocation('/cart?buyNow=true');
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem adding this item to your cart.",
        variant: "destructive",
      });
    } finally {
      setLoadingStates(prev => ({...prev, [product.id]: false}));
    }
  };

  // Fetch all products
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Filter for luxury lighter products
  const luxuryLighters = products?.filter(product => 
    product.collection === "luxury" && 
    product.category === "Lighter"
  ) || [];

  // Featured product (first in the list)
  const featuredProduct = luxuryLighters[0];

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
      {/* Hero Section with Quick Buy */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-800 p-8 md:p-16"
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
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div className="h-px w-12 bg-gold/60"></div>
            <Crown className="h-10 w-10 text-gold" />
            <div className="h-px w-12 bg-gold/60"></div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl md:text-5xl font-light tracking-wider text-white mb-4"
          >
            Luxury Lighters Collection
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-zinc-300 leading-relaxed mb-6 text-lg max-w-2xl mx-auto"
          >
            Discover our exquisite collection of premium lighters, each piece a testament to unparalleled craftsmanship
            and timeless elegance.
          </motion.p>
          
          {/* Direct Buy Section */}
          {featuredProduct && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-8 max-w-md mx-auto bg-black/50 backdrop-blur-sm rounded-xl p-5 border border-gold/20"
            >
              <div className="flex items-center justify-center mb-4">
                <h3 className="text-gold text-xl font-light tracking-wider mr-3">Featured: {featuredProduct.name}</h3>
                <Badge className="bg-gold/20 text-gold">{formatPrice(featuredProduct.price)}</Badge>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <Button 
                  className="bg-primary hover:bg-primary/90 text-black font-semibold px-6"
                  onClick={() => handleQuickBuy(featuredProduct)}
                  disabled={loadingStates[featuredProduct.id]}
                >
                  {loadingStates[featuredProduct.id] ? (
                    <>Processing...</>
                  ) : (
                    <>Buy Now <ArrowRight className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
                <Link href={`/product/${featuredProduct.id}`}>
                  <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10">
                    View Details
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Product Grid Section - Most Important Part */}
      <div className="mb-10">
        <div className="mb-6 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-light tracking-wider text-white mb-4"
          >
            Shop Luxury Lighters
          </motion.h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto"></div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array(3)
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
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {/* Simplified Product Cards with Quick Buy Buttons */}
            {luxuryLighters.map((product) => (
              <motion.div 
                key={product.id}
                className="bg-gradient-to-br from-zinc-900 to-black rounded-xl overflow-hidden border border-zinc-800/40 hover:border-gold/30 transition-all duration-300 hover:shadow-[0_0_15px_rgba(218,165,32,0.15)]"
                whileHover={{ y: -5 }}
              >
                <Link href={`/product/${product.id}`}>
                  <div className="relative aspect-square bg-black/50 overflow-hidden">
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-full h-full object-contain p-6 transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-gold/20 text-gold px-2 py-1">
                        <Crown className="h-3 w-3 mr-1" /> 
                        Premium
                      </Badge>
                    </div>
                  </div>
                </Link>
                
                <div className="p-6">
                  <Link href={`/product/${product.id}`}>
                    <h3 className="text-xl font-light text-white mb-2 hover:text-gold transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  
                  <p className="text-zinc-400 text-sm mb-4 line-clamp-2 h-10">
                    {product.description.substring(0, 100)}...
                  </p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-gold text-xl font-light">
                      {formatPrice(product.price)}
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-gold" fill="#daa520" />
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 bg-primary hover:bg-primary/90 text-black font-semibold"
                      onClick={() => handleQuickBuy(product)}
                      disabled={loadingStates[product.id]}
                    >
                      {loadingStates[product.id] ? (
                        <>Processing...</>
                      ) : (
                        <>Buy Now <ArrowRight className="ml-1 h-4 w-4" /></>
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="border-zinc-700 hover:border-gold/30 hover:bg-black/50"
                      onClick={async () => {
                        try {
                          await addItem(product);
                          toast({
                            description: `${product.name} added to cart`,
                          });
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to add item to cart",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
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

      {/* Features Section (Condensed) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="mb-10 bg-gradient-to-br from-zinc-900/80 to-black/80 rounded-xl border border-zinc-800/50 p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="p-4 hover:bg-black/50 rounded-lg transition-colors">
              <div className="flex items-start">
                <div className="mr-3 mt-1">{feature.icon}</div>
                <div>
                  <h3 className="text-white font-light mb-1">{feature.title}</h3>
                  <p className="text-zinc-400 text-sm">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Call to Action */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="text-center py-8 mt-4 bg-gradient-to-br from-zinc-900/80 to-black/80 rounded-xl border border-zinc-800/50"
      >
        <h2 className="text-2xl font-light tracking-wider text-white mb-4">
          Fast and Secure Checkout
        </h2>
        <p className="text-zinc-300 mb-6 max-w-md mx-auto">
          Enjoy exclusive benefits with your luxury lighter purchase:
          free shipping, 30-day returns, and lifetime support.
        </p>
        <Link href={featuredProduct ? `/product/${featuredProduct.id}` : "/premium-collection"}>
          <LuxuryButton>
            Shop Now <ChevronRight className="h-4 w-4 ml-1" />
          </LuxuryButton>
        </Link>
      </motion.div>
    </div>
  );
}