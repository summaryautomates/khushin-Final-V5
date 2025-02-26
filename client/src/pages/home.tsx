import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, useScroll, useTransform } from "framer-motion";
import { NewsletterDialog } from "@/components/dialogs/newsletter-dialog";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/products/product-grid";
import { ExperienceBoxes } from "@/components/ExperienceBoxes";
import type { Product } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Star, Clock, Calendar, Mic, Camera, Loader2 } from "lucide-react";
import { useState, useRef, useEffect, useMemo, lazy, Suspense } from "react";
import { useToast } from "@/hooks/use-toast";
import React from 'react';

// Lazy load Tesseract.js
const initTesseract = async () => {
  const { createWorker } = await import("tesseract.js");
  return createWorker();
};

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const { toast } = useToast();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: 300000, // Cache results for 5 minutes
    gcTime: 3600000, // Keep in cache for 1 hour (renamed from cacheTime)
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<any>(null);

  // Memoize suggestions calculation
  const suggestions = useMemo(() => {
    if (!searchQuery) return [];
    const normalizedQuery = searchQuery.toLowerCase();
    return products
      .map((p) => p.name)
      .filter(
        (name) =>
          name.toLowerCase() !== normalizedQuery &&
          name.toLowerCase().includes(normalizedQuery),
      )
      .slice(0, 3);
  }, [searchQuery, products]);

  const handleVoiceSearch = () => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
      };

      recognition.onerror = (error: any) => {
        console.error("Speech recognition error:", error);
        setIsListening(false);
        toast({
          title: "Voice Search Error",
          description: "Failed to recognize speech. Please try again.",
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      toast({
        title: "Not Supported",
        description: "Voice search is not supported in your browser",
        variant: "destructive",
      });
    }
  };

  const handleImageSearch = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a valid image file (JPEG, PNG, or GIF)",
        variant: "destructive",
      });
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingImage(true);
    try {
      if (!workerRef.current) {
        workerRef.current = await initTesseract();
      }

      const worker = workerRef.current;
      await worker.loadLanguage("eng");
      await worker.initialize("eng");
      const result = await worker.recognize(file);
      const cleanText = result.data.text.replace(/[^\w\s]/gi, "").trim();

      if (cleanText) {
        setSearchQuery(cleanText);
        toast({
          title: "Image Processed",
          description: "Text extracted successfully",
        });
      } else {
        toast({
          title: "No Text Found",
          description: "Could not extract text from the image",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Image processing error:", error);
      toast({
        title: "Processing Error",
        description:
          error instanceof Error ? error.message : "Failed to process image",
        variant: "destructive",
      });
    } finally {
      if (workerRef.current) {
        await workerRef.current.terminate();
        workerRef.current = null;
      }
      setIsProcessingImage(false);
    }
  };

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.98]);

  const handleBookExperience = () => {
    setLocation("/event-organizer");
  };

  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <div className="flex flex-col">
        {/* Enhanced Hero Section */}
        <section className="h-screen w-full flex items-center justify-center bg-black relative overflow-hidden">
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.85 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 w-full h-full"
          >
            <div style={{ display: 'contents' }}>
              <img
                src="https://api.deepai.org/job-view-file/7971ae63-6c4a-439b-bcfe-afc3778a8c1b/outputs/output.jpg"
                className="absolute inset-0 w-full h-full object-cover"
                alt="Hero background"
                style={{ objectPosition: "center" }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black"></div>
            </div>
          </motion.div>

          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="relative z-10 text-center px-4 max-w-4xl mx-auto"
          >
            <motion.h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              Welcome to <span className="text-primary">KHUSH.IN</span>
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              Experience our exclusive collection of premium products with unmatched quality and design.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <a href="/products" className="bg-primary hover:bg-primary/90 text-white font-medium py-3 px-8 rounded-lg transition-all duration-300 shadow-glow">
                Explore Products
              </a>
              <a href="/auth-page" className="bg-transparent border border-white/30 backdrop-blur-sm hover:bg-white/10 text-white font-medium py-3 px-8 rounded-lg transition-all duration-300">
                Sign In
              </a>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <svg className="w-6 h-10 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </section>

        {/* Experience Boxes Section with Enhanced Styling */}
        <section className="py-20 px-4 bg-gradient-to-b from-background to-background/90">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Discover the Experience</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our curated selection provides an unparalleled luxury experience
              </p>
            </motion.div>
            <ExperienceBoxes />
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-4 bg-accent/5">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Hear from our satisfied customers about their experiences
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Aisha K.",
                  quote: "The quality of products I received exceeded my expectations. The attention to detail is remarkable.",
                  role: "Designer"
                },
                {
                  name: "Rahul S.",
                  quote: "Fast delivery and impeccable customer service. I'll definitely be shopping here again!",
                  role: "Entrepreneur"
                },
                {
                  name: "Priya M.",
                  quote: "The customization options are fantastic. I got exactly what I was looking for.",
                  role: "Artist"
                }
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="bg-card p-6 rounded-xl shadow-card hover:shadow-hover transition-all duration-300"
                >
                  <div className="flex flex-col h-full">
                    <div className="mb-4 text-primary">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.82 16H3L7.18 8H12L9.82 16ZM19.82 16H13L17.18 8H22L19.82 16Z" fill="currentColor"/>
                      </svg>
                    </div>
                    <p className="text-foreground mb-4 flex-grow">{testimonial.quote}</p>
                    <div className="mt-auto">
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-20 px-4 bg-primary/5">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Updated</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Subscribe to our newsletter for exclusive offers and updates
              </p>

              <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-10 px-4 py-2 rounded-md transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </motion.div>
          </div>
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
                className="container"
              >
                <ProductGrid products={[]} isLoading={true} />
              </motion.div>
            ) : (
              <ProductGrid products={products.slice(0, 4)} isLoading={false} />
            )}

            <div className="mt-12 text-center">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full"
                onClick={() => setLocation("/products")}
              >
                See More Products
              </Button>
            </div>
          </motion.div>
        </section>
      </div>
    </Suspense>
  );
}