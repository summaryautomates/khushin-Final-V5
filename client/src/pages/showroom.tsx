import React from "react";
import { motion } from "framer-motion";
import { VirtualShowroom, ShowroomModel } from "@/components/3d/VirtualShowroom";
import { LuxuryButton } from "@/components/ui/luxury-button";
import { ArrowRight } from "lucide-react";

// Sample model data
const demoModels: ShowroomModel[] = [
  {
    id: "model-1",
    name: "Luxury Lighter - Gold Edition",
    description: "Our signature gold-plated lighter with precision-engineered flame control and elegant design. Handcrafted with the finest materials for a truly luxurious experience.",
    features: [
      "24K Gold-plated exterior",
      "Wind-resistant flame technology",
      "Adjustable flame height",
      "Engraving customization available",
      "Premium butane reservoir",
      "Lifetime warranty"
    ],
    modelPath: "/models/luxury-lighter.gltf", // Local GLTF path
    thumbnailImage: "/products/lighter1.jpg",
    scale: 2.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0]
  },
  {
    id: "model-2",
    name: "Classic Collection - Silver",
    description: "A timeless masterpiece from our Classic Collection, featuring sterling silver construction and our signature flame-control technology for perfect lighting every time.",
    features: [
      "Sterling silver construction",
      "Signature flame control system",
      "Impact-resistant casing",
      "Extended fuel capacity",
      "Elegant gift box included",
      "10-year warranty"
    ],
    modelPath: "/models/luxury-lighter.gltf", // Local GLTF path
    thumbnailImage: "/products/lighter2.jpg",
    scale: 2.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0]
  },
  {
    id: "model-3",
    name: "Diamond Series - Limited Edition",
    description: "Our most exclusive lighter, featuring genuine diamond accents set in platinum. Limited to only 100 pieces worldwide, with unique serial number and authentication certificate.",
    features: [
      "Genuine diamond accents",
      "Platinum-coated exterior",
      "Numbered limited edition series",
      "Authentication certificate",
      "Advanced flame adjustment system",
      "Luxury presentation case"
    ],
    modelPath: "/models/luxury-lighter.gltf", // Local GLTF path
    thumbnailImage: "/products/lighter3.jpg",
    scale: 2.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0]
  }
];

const Showroom = () => {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Hero Section */}
      <section className="min-h-[50vh] flex items-center justify-center bg-black relative overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <motion.div
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.7 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="h-full w-full"
          >
            <img
              src="/images/showroom-bg.jpg"  
              className="w-full h-full object-cover object-center opacity-50"
              alt="Virtual Showroom"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 to-black/95"></div>
          </motion.div>
        </div>

        <div className="container relative z-10 px-4 py-16 max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center gap-8">
            {/* Main Heading with elegant divider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="relative"
            >
              <div className="absolute left-0 right-0 h-[1px] top-1/2 transform -translate-y-1/2 z-0">
                <div className="h-full w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
              </div>
              
              <motion.h1
                initial={{ letterSpacing: "0.2em", opacity: 0, y: -20 }}
                animate={{ letterSpacing: "0.1em", opacity: 1, y: 0 }}
                transition={{ duration: 1.5, delay: 0.7, ease: "easeOut" }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extralight tracking-wider text-center relative z-10"
              >
                <span className="bg-black px-6 py-2">
                  <span className="bg-gradient-to-r from-white via-primary/90 to-white bg-clip-text text-transparent pb-2">
                    Virtual Showroom
                  </span>
                </span>
              </motion.h1>
            </motion.div>
            
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
              className="backdrop-blur-sm bg-black/30 p-6 sm:p-8 rounded-none border border-zinc-800 hover:border-primary/20 transition-all duration-500 max-w-3xl relative overflow-hidden group"
            >
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-10 h-10 pointer-events-none">
                <div className="absolute top-0 left-0 w-[30%] h-[1px] bg-primary transform origin-left transition-all duration-700 group-hover:w-full"></div>
                <div className="absolute top-0 left-0 h-[30%] w-[1px] bg-primary transform origin-top transition-all duration-700 group-hover:h-full"></div>
              </div>
              
              <div className="absolute bottom-0 right-0 w-10 h-10 pointer-events-none">
                <div className="absolute bottom-0 right-0 w-[30%] h-[1px] bg-primary transform origin-right transition-all duration-700 group-hover:w-full"></div>
                <div className="absolute bottom-0 right-0 h-[30%] w-[1px] bg-primary transform origin-bottom transition-all duration-700 group-hover:h-full"></div>
              </div>
              
              <motion.p className="text-lg md:text-xl text-white text-center leading-relaxed relative z-10">
                Experience our exclusive collection in stunning 3D detail. Rotate, zoom, and explore every aspect of our luxury products from the comfort of your screen.
              </motion.p>
              
              {/* Subtle glow on hover */}
              <div className="absolute inset-0 opacity-0 bg-primary/3 blur-xl transition-opacity duration-1000 group-hover:opacity-100"></div>
            </motion.div>
            
            {/* Call to action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
            >
              <LuxuryButton size="lg" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
                Explore Collection <ArrowRight className="ml-2 h-4 w-4" />
              </LuxuryButton>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Virtual Showroom Section */}
      <section className="py-20 bg-gradient-to-b from-black to-zinc-950">
        <VirtualShowroom 
          models={demoModels} 
          title="Interactive Collection"
          description="Explore our premium products in exquisite 3D detail"
        />
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-zinc-950 to-black">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-extralight tracking-wider uppercase mb-4"
            >
              <span className="bg-gradient-to-r from-primary/80 via-white to-primary/80 bg-clip-text text-transparent pb-2">
                Virtual Experience
              </span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-zinc-400 max-w-xl mx-auto"
            >
              Our virtual showroom brings the luxury shopping experience to your screen
            </motion.p>
            
            <div className="h-[1px] w-40 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-8"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: "Immersive 3D Models",
                description: "Explore every detail with fully interactive 3D models that you can rotate and zoom."
              },
              {
                title: "Exclusive Collection",
                description: "View our limited edition pieces and signature designs from every angle."
              },
              {
                title: "Premium Showcase",
                description: "Experience the quality of our craftsmanship without visiting a physical store."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                viewport={{ once: true }}
                className="group relative h-full bg-black/50 backdrop-blur-sm border border-zinc-800 p-6 overflow-hidden transition-all duration-500 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                {/* Gold accent corner lines */}
                <div className="absolute top-0 left-0 w-10 h-10 pointer-events-none">
                  <div className="absolute top-0 left-0 w-[30%] h-[1px] bg-primary transform origin-left transition-all duration-500 group-hover:w-full"></div>
                  <div className="absolute top-0 left-0 h-[30%] w-[1px] bg-primary transform origin-top transition-all duration-500 group-hover:h-full"></div>
                </div>
                
                <div className="absolute bottom-0 right-0 w-10 h-10 pointer-events-none">
                  <div className="absolute bottom-0 right-0 w-[30%] h-[1px] bg-primary transform origin-right transition-all duration-500 group-hover:w-full"></div>
                  <div className="absolute bottom-0 right-0 h-[30%] w-[1px] bg-primary transform origin-bottom transition-all duration-500 group-hover:h-full"></div>
                </div>
                
                <h3 className="text-xl font-light tracking-wide uppercase mb-3 transition-colors duration-300 group-hover:text-primary">
                  {feature.title}
                </h3>
                
                <p className="text-zinc-400 leading-relaxed transition-colors duration-300 group-hover:text-zinc-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Showroom;