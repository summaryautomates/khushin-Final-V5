import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplet, Zap, Shield, Settings, ChevronRight } from "lucide-react";

export default function Refueling() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="min-h-[60vh] flex items-center justify-center bg-black relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.5 }}
            transition={{ duration: 1.5 }}
          >
            <img 
              src="https://images.unsplash.com/photo-1614946973832-3363f6aa5635?q=80&w=2574&auto=format&fit=crop"
              className="w-full h-full object-cover"
              alt="Luxury refueling background"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black"></div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="container relative z-10 px-4"
        >
          <motion.h1 
            initial={{ letterSpacing: "0.2em", opacity: 0 }}
            animate={{ letterSpacing: "0.1em", opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.3 }}
            className="text-5xl md:text-6xl font-extralight mb-6 tracking-wider text-center"
          >
            Refueling Solutions
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-lg md:text-xl text-zinc-400 text-center max-w-2xl mx-auto leading-relaxed"
          >
            Experience the perfect blend of convenience and reliability with our premium refueling solutions.
            Each refill is carefully engineered to maintain the integrity of your luxury lighter.
          </motion.p>
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
      <section className="py-24 bg-black">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-light text-center mb-12 tracking-wider">Essential Guide</h2>
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

      {/* CTA Section */}
      <section className="py-16 bg-zinc-950">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-xl mx-auto text-center"
          >
            <h2 className="text-2xl font-light mb-6 tracking-wider">Ready to Enhance Your Experience?</h2>
            <Button size="lg" className="rounded-full gap-2 bg-primary/90 hover:bg-primary">
              Shop Refueling Accessories
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}