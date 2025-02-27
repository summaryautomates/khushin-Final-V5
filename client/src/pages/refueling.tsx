import { motion } from "framer-motion";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplet, Zap, Shield, Settings, ChevronRight } from "lucide-react";

const Refueling = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="min-h-[70vh] flex items-center justify-center bg-black relative overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <motion.div
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.85 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="h-full w-full"
          >
            <img 
              src="https://i.imghippo.com/files/I2429lk.jpg"
              className="w-full h-full object-cover object-center"
              alt="Luxury refueling background"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/90"></div>
          </motion.div>
        </div>
        <div className="absolute top-8 right-8 z-20">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <a href="https://i.imghippo.com/files/Wfm7659yCM.png" target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="rounded-full gap-2 bg-primary/90 hover:bg-primary">
                Shop Refueling Accessories
                <ChevronRight className="w-4 h-4" />
              </Button>
            </a>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="container relative z-10 px-4 py-16"
        >
          <motion.h1 
            initial={{ letterSpacing: "0.2em", opacity: 0, y: -20 }}
            animate={{ letterSpacing: "0.1em", opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extralight mb-8 md:mb-10 tracking-wider text-center bg-gradient-to-r from-white via-primary/80 to-white bg-clip-text text-transparent pb-2"
          >
            <Link href="/refueling">Refueling Solutions</Link>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
            className="backdrop-blur-sm bg-black/30 p-6 rounded-lg border border-primary/10 max-w-3xl mx-auto"
          >
            <motion.p 
              className="text-lg md:text-xl text-white text-center mx-auto leading-relaxed"
            >
              Experience the perfect blend of convenience and reliability with our premium refueling solutions.
              Each refill is carefully engineered to maintain the integrity of your luxury lighter.
            </motion.p>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-zinc-950">
        <div className="container px-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Droplet,
                title: "Premium Butane",
                description: "Ultra-refined butane fuel specially formulated for luxury lighters."
              },
              {
                icon: Zap,
                title: "Quick Refill",
                description: "Efficient refilling system designed for ease and speed."
              },
              {
                icon: Shield,
                title: "Safety First",
                description: "Built-in safety mechanisms for secure and controlled refilling."
              },
              {
                icon: Settings,
                title: "Maintenance",
                description: "Complete maintenance kit for optimal lighter performance."
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/[0.02] backdrop-blur-sm border-primary/10 hover:border-primary/20 transition-all duration-300 hover:scale-[1.02]">
                  <CardHeader>
                    <feature.icon className="w-8 h-8 mb-2 text-primary" />
                    <CardTitle className="text-xl font-light">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Guide Section */}
      <section className="py-28 bg-gradient-to-b from-black to-black/95">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-light text-center mb-16 tracking-wider relative pb-4 inline-block mx-auto w-full">
              <span className="bg-gradient-to-r from-primary/70 via-white to-primary/70 bg-clip-text text-transparent">Essential Guide</span>
              <motion.div 
                className="absolute bottom-0 left-1/2 h-0.5 bg-primary/30 w-24 transform -translate-x-1/2"
                initial={{ width: 0 }}
                whileInView={{ width: "6rem" }}
                transition={{ delay: 0.3, duration: 0.8 }}
                viewport={{ once: true }}
              ></motion.div>
            </h2>
            <div className="grid gap-8 md:grid-cols-2">
              <Card className="bg-white/[0.02] backdrop-blur-sm border-primary/10 hover:border-primary/20 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-light">Refueling Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-4 text-muted-foreground">
                    {[
                      "Turn the lighter upside down",
                      "Locate the refill valve at the bottom",
                      "Press the fuel canister nozzle firmly into the valve",
                      "Hold for 5-10 seconds until full",
                      "Wait 2 minutes before use"
                    ].map((step, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                        viewport={{ once: true }}
                        className="flex items-center gap-2"
                      >
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </motion.li>
                    ))}
                  </ol>
                </CardContent>
              </Card>

              <Card className="bg-white/[0.02] backdrop-blur-sm border-primary/10 hover:border-primary/20 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-light">Safety Precautions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4 text-muted-foreground">
                    {[
                      "Refill in a well-ventilated area",
                      "Keep away from open flames",
                      "Use only premium butane fuel",
                      "Don't overfill",
                      "Allow gas to stabilize before use"
                    ].map((precaution, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                        viewport={{ once: true }}
                        className="flex items-center gap-2"
                      >
                        <Shield className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{precaution}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Removed CTA Section */}
    </div>
  );
};

export default Refueling;