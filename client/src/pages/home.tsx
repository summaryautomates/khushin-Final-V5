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
import { AdaptiveImage } from "@/components/ui/adaptive-image";
import { AnimatedText } from "@/components/ui/animated-text";

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
        {/* Hero Section */}
        <section className="relative min-h-[90vh] w-full flex items-center justify-center bg-black">
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.85 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 w-full h-full"
          >
            <div style={{ display: 'contents' }}>
              <AdaptiveImage
                src="/hero-image.png"
                alt="Luxury KHUSH lighter"
                className="absolute inset-0 w-full h-full object-cover opacity-85"
                containerClassName="absolute inset-0"
                priority={true}
                onLoadError={(error: any) => {
                  console.error('Hero image load error:', error);
                  toast({
                    title: "Image Load Error",
                    description: "Failed to load hero image. Please refresh the page.",
                    variant: "destructive",
                  });
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black"></div>
            </div>
          </motion.div>

          <motion.div
            style={{ opacity, scale }}
            className="container relative z-10 px-4 sm:px-6 py-16 md:py-24"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="max-w-4xl mx-auto"
            >
              <motion.h1
                className="text-5xl sm:text-6xl md:text-7xl font-extralight mb-8 md:mb-10 tracking-wider text-center mx-auto leading-tight"
              >
                <span className="block">
                  <AnimatedText
                    text="Make Your"
                    className="bg-gradient-to-r from-white via-primary/80 to-white bg-clip-text text-transparent"
                  />
                </span>
                <span className="block mt-2">
                  <AnimatedText
                    text="Loved One Happy!"
                    className="bg-gradient-to-r from-white via-primary/80 to-white bg-clip-text text-transparent"
                  />
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="text-lg md:text-xl leading-relaxed text-zinc-300 max-w-2xl mx-auto tracking-wide text-center font-light"
              >
                Exclusive luxury lighters - The perfect gift to light up our smile.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.8 }}
                className="mt-12 md:mt-16"
              >
                <div className="flex flex-col items-center gap-6">
                  <div className="flex flex-col gap-3 w-full max-w-lg">
                    <div className="flex gap-2">
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search our luxury collection..."
                        className="border-primary/20 rounded-full flex-grow"
                      />
                      <Button
                        variant="secondary"
                        className={`rounded-full min-w-[44px] ${isListening ? "bg-red-500 hover:bg-red-600" : ""}`}
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
                        className="rounded-full min-w-[44px]"
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
                      <div className="bg-background/90 backdrop-blur-sm border border-primary/20 rounded-lg p-2 space-y-1">
                        <p className="text-sm text-muted-foreground px-2">
                          Did you mean:
                        </p>
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
                    className="flex flex-wrap justify-center gap-3"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                      onClick={() => setLocation("/premium-collection")}
                    >
                      <Star className="w-4 h-4" /> Premium Collection
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                      onClick={() => setLocation("/express-delivery")}
                    >
                      <Clock className="w-4 h-4" /> Express Delivery
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
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
        <section className="py-24 md:py-32 bg-zinc-950">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="container px-4 sm:px-6"
          >
            <motion.h2
              initial={{ letterSpacing: "0.3em", opacity: 0 }}
              whileInView={{ letterSpacing: "0.2em", opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-extralight text-center mb-16 md:mb-24 text-white tracking-wider"
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
              <ProductGrid
                products={Array.isArray(products) ? products.slice(0, 4) : []}
                isLoading={false}
              />
            )}

            <div className="mt-16 text-center">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8"
                onClick={() => setLocation("/products")}
              >
                See More Products
              </Button>
            </div>
          </motion.div>
        </section>

        {/* Experience Boxes Section */}
        <section className="py-16 md:py-24 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <ExperienceBoxes />
          </div>
        </section>
      </div>
    </Suspense>
  );
}