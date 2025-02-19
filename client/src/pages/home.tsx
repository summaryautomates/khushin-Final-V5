import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, useScroll, useTransform } from "framer-motion";
import { NewsletterDialog } from "@/components/dialogs/newsletter-dialog";
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
  Mic,
  Camera,
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
import { useState, useRef, useEffect } from "react";
import { createWorker } from 'tesseract.js';
import { toast } from "@/hooks/use-toast";


export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

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

      recognition.onerror = () => {
        setIsListening(false);
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

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a valid image file (JPEG, PNG, or GIF)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Processing Image",
        description: "Please wait while we analyze the image...",
      });

      const worker = await createWorker({
        logger: progress => {
          console.log('OCR Progress:', progress);
        },
      });

      console.log('Worker created, loading...');
      await worker.load();
      console.log('Loading language...');
      await worker.loadLanguage('eng');
      console.log('Initializing...');
      await worker.initialize('eng');
      console.log('Starting recognition...');

      const { data: { text } } = await worker.recognize(file);
      console.log('Recognition completed:', text);
      await worker.terminate();

      const cleanText = text.replace(/[^\w\s]/gi, '').trim();
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
      let errorMessage = "Failed to process image";

      if (error instanceof Error) {
        console.error('Error details:', error.message);
        errorMessage = `Error: ${error.message}`;
      }

      toast({
        title: "Processing Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const getSuggestions = (query: string) => {
    if (!products || !query) return [];

    const normalizedQuery = query.toLowerCase();
    const productNames = products.map(p => p.name.toLowerCase());

    return productNames
      .filter(name => name !== normalizedQuery && name.includes(normalizedQuery))
      .slice(0, 3);
  };

  useEffect(() => {
    const newSuggestions = getSuggestions(searchQuery);
    setSuggestions(newSuggestions);
  }, [searchQuery, products]);

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.98]);

  const handleBookExperience = () => {
    setLocation('/event-organizer');
  };

  return (
    <>
      <NewsletterDialog />
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
                      >
                        <Mic className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        className="rounded-full"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="w-4 h-4" />
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
    </>
  );
}