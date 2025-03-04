import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplet, Zap, Shield, Settings, ChevronRight, Clock, MapPin, CreditCard } from "lucide-react";

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

        <div className="container relative z-10 px-4 py-16 max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center gap-8">
            {/* Appointment Button */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative cursor-pointer transform hover:scale-105 transition-transform duration-300"
              onClick={() => window.open('https://khushi.setmore.com/saransh', '_blank')}
            >
              <img 
                src="/images/appointment-badge.png"
                alt="Book Your Appointment" 
                className="w-64 h-64 object-contain hover:opacity-90 transition-opacity"
                style={{ 
                  filter: "drop-shadow(0 0 20px rgba(255, 255, 0, 0.4))"
                }}
              />
            </motion.div>

            {/* Main Heading */}
            <motion.h1 
              initial={{ letterSpacing: "0.2em", opacity: 0, y: -20 }}
              animate={{ letterSpacing: "0.1em", opacity: 1, y: 0 }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extralight tracking-wider text-center"
            >
              <span className="bg-gradient-to-r from-white via-primary/80 to-white bg-clip-text text-transparent pb-2">
                Refueling Solutions
              </span>
            </motion.h1>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
              className="backdrop-blur-sm bg-black/30 p-6 rounded-lg border border-primary/10 max-w-3xl"
            >
              <motion.p className="text-lg md:text-xl text-white text-center leading-relaxed">
                Experience the perfect blend of convenience and reliability with our premium refueling solutions.
                Each refill is carefully engineered to maintain the integrity of your luxury lighter.
              </motion.p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid and Guide Section */}
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
                className="h-full"
              >
                <Card className="bg-white/[0.02] backdrop-blur-sm border-primary/10 hover:border-primary/20 transition-all duration-300 hover:scale-[1.02] h-full flex flex-col">
                  <CardHeader>
                    <feature.icon className="w-8 h-8 mb-2 text-primary" />
                    <CardTitle className="text-xl font-light">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Refueling Information Section */}
      <section className="py-28 bg-gradient-to-b from-black to-black/95">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-5xl mx-auto"
          >
            {/* Shop Button */}
            <div className="flex justify-center mb-12">
              <Button 
                variant="ghost" 
                className="p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-transparent"
                onClick={() => {
                  window.open("https://i.imghippo.com/files/Ojp4347XDA.png", "_blank", "noopener,noreferrer");
                }}
              >
                <img 
                  src="https://i.imghippo.com/files/Wfm7659yCM.png" 
                  alt="Shop Refueling Accessories" 
                  className="h-24 w-auto hover:opacity-90 transition-opacity"
                  style={{ 
                    filter: "drop-shadow(0 0 15px rgba(255, 255, 255, 0.9))",
                    maxWidth: "140px"
                  }}
                />
              </Button>
            </div>

            <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
              {/* Refueling Steps */}
              <Card className="bg-white/[0.02] backdrop-blur-sm border-primary/10 hover:border-primary/20 transition-all duration-300 h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl font-light flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    Refueling Steps
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
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

              {/* Safety Precautions */}
              <Card className="bg-white/[0.02] backdrop-blur-sm border-primary/10 hover:border-primary/20 transition-all duration-300 h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl font-light flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Safety Precautions
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
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

              {/* Station Hours & Services */}
              <Card className="bg-white/[0.02] backdrop-blur-sm border-primary/10 hover:border-primary/20 transition-all duration-300 h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl font-light flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Station Hours & Services
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between">
                  <ul className="space-y-4 text-muted-foreground">
                    <motion.li
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>Premium locations for quick refuels</span>
                    </motion.li>
                    <motion.li
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-2"
                    >
                      <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>9 AM - 5 PM, Extended hours available</span>
                    </motion.li>
                    <motion.li
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-2"
                    >
                      <CreditCard className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>Subscription benefits & cost savings</span>
                    </motion.li>
                  </ul>
                  <div className="pt-4 mt-auto">
                    {/*Removed Duplicate Appointment Button*/}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Refueling;