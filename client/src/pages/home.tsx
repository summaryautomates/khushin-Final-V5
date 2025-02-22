import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, useScroll, useTransform } from "framer-motion";
import { NewsletterDialog } from "@/components/dialogs/newsletter-dialog";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/products/product-grid";
import type { Product } from "@shared/schema";
import { Input } from "@/components/ui/input";
import {
  Star,
  Clock,
  Calendar,
  Mic,
  Camera,
  Loader2
} from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { createWorker } from 'tesseract.js';
import type { Worker } from 'tesseract.js';
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const { toast } = useToast();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: 30000, // Cache results for 30 seconds
    retry: 2,
    refetchOnWindowFocus: false
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);

  // Memoize suggestions calculation
  const suggestions = useMemo(() => {
    if (!searchQuery) return [];
    const normalizedQuery = searchQuery.toLowerCase();
    return products
      .map(p => p.name)
      .filter(name =>
        name.toLowerCase() !== normalizedQuery &&
        name.toLowerCase().includes(normalizedQuery)
      )
      .slice(0, 3);
  }, [searchQuery, products]);

  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window) {
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

  const handleImageSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
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
        workerRef.current = createWorker();
      }

      const worker = workerRef.current;
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      const result = await worker.recognize(file);
      const cleanText = result.data.text.replace(/[^\w\s]/gi, '').trim();

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
      console.error('Image processing error:', error);
      toast({
        title: "Processing Error",
        description: error instanceof Error ? error.message : "Failed to process image",
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
    setLocation('/event-organizer');
  };

  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <NewsletterDialog />
      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="h-screen w-full flex items-center justify-center bg-black relative overflow-hidden">
          <div className="absolute inset-0">
            <motion.div
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.5 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0"
            >
              <img
                src="https://images.unsplash.com/photo-1483968049578-867b9ad94034?q=80&w=2072&auto=format"
                className="w-full h-full object-cover"
                alt="Hero background"
                style={{ objectPosition: 'center' }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black"></div>
            </motion.div>
          </div>

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
                  <div className="flex flex-col gap-2 w-full max-w-md">
                    <div className="flex gap-2">
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search our luxury collection..."
                        className="border-primary/20 rounded-full flex-grow"
                      />
                      <Button
                        variant="secondary"
                        className={`rounded-full ${isListening ? 'bg-red-500 hover:bg-red-600' : ''}`}
                        onClick={handleVoiceSearch}
                        disabled={isListening}
                      >
                        {isListening ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Mic className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="secondary"
                        className="rounded-full"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessingImage}
                      >
                        {isProcessingImage ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Camera className="w-4 h-4" />
                        )}
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageSearch}
                      />
                    </div>
                    {suggestions.length > 0 && (
                      <div className="bg-background/80 backdrop-blur-sm border border-primary/20 rounded-lg p-2 space-y-1">
                        <p className="text-sm text-muted-foreground px-2">Did you mean:</p>
                        {suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            className="w-full justify-start text-left"
                            onClick={() => setSearchQuery(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 mt-3 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                      onClick={() => window.location.href = '/express-delivery'}
                    >
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
                onClick={() => setLocation('/products')}
              >
                See More Products
              </Button>
            </div>
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
    </>
  );
}