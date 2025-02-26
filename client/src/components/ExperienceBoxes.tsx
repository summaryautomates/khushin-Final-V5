import { Link } from "wouter";
import { Clock, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExperienceBoxes() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto text-center">
        <div className="flex flex-col items-center space-y-4">
          <Clock className="w-16 h-16 text-white" />
          <h2 className="text-2xl font-semibold text-white">Book Experience</h2>
          <p className="text-zinc-400 mb-4">
            Schedule premium styling sessions with our expert consultants for a personalized luxury experience
          </p>
          <Link href="/event-organizer">
            <Button className="rounded-md">Book Now</Button>
          </Link>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <Gift className="w-16 h-16 text-white" />
          <h2 className="text-2xl font-semibold text-white">Loyalty Program</h2>
          <p className="text-zinc-400 mb-4">
            Join our exclusive rewards program and earn points on every purchase for special discounts
          </p>
          <Link href="/loyalty">
            <Button className="rounded-md">Join Program</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
import { motion } from 'framer-motion';
import { ShoppingBag, PackageCheck, Shield, HeartHandshake } from 'lucide-react';

export function ExperienceBoxes() {
  const features = [
    {
      icon: ShoppingBag,
      title: "Premium Selection",
      description: "Discover our carefully curated collection of premium products"
    },
    {
      icon: PackageCheck,
      title: "Quality Guaranteed",
      description: "Every product meets our stringent quality standards"
    },
    {
      icon: Shield,
      title: "Secure Shopping",
      description: "Shop with confidence with our secure payment options"
    },
    {
      icon: HeartHandshake,
      title: "Dedicated Support",
      description: "Our team is ready to assist you with any questions"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {features.map((feature, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          viewport={{ once: true }}
          whileHover={{ y: -5 }}
          className="bg-card hover:bg-card/90 border border-border/40 rounded-xl p-6 shadow-soft transition-all duration-300"
        >
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <feature.icon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
          <p className="text-muted-foreground">{feature.description}</p>
        </motion.div>
      ))}
    </div>
  );
}
