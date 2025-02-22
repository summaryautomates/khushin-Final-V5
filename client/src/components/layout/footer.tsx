import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import React, { useState } from "react";
import {
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
} from "lucide-react";

export function Footer() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    toast({
      title: "Thank you for subscribing!",
      description: "You'll receive our updates at " + email,
    });
    setEmail("");
  };

  return (
    <footer className="bg-black text-white py-16">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-semibold mb-4">Support</h3>
          <ul className="space-y-2">
            <li><Link href="/faqs"><span className="hover:text-primary transition-colors">FAQs</span></Link></li>
            <li><Link href="/warranty"><span className="hover:text-primary transition-colors">Warranty</span></Link></li>
            <li><Link href="/shipping"><span className="hover:text-primary transition-colors">Shipping</span></Link></li>
            <li><Link href="/returns"><span className="hover:text-primary transition-colors">Returns</span></Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-4">Customer Care</h3>
          <ul className="space-y-2">
            <li><a href="mailto:contact@khush.in" className="hover:text-primary transition-colors">Email</a></li>
            <li><a href="tel:+91-1800-123-4567" className="hover:text-primary transition-colors">Toll Free: 1800-123-4567</a></li>
            <li><a href="https://wa.me/919898989898" className="hover:text-primary transition-colors">WhatsApp Support</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-4">Explore</h3>
          <ul className="space-y-2">
            <li><Link href="/"><span className="hover:text-primary transition-colors">Home</span></Link></li>
            <li><Link href="/about"><span className="hover:text-primary transition-colors">About</span></Link></li>
            <li><Link href="/products"><span className="hover:text-primary transition-colors">Products</span></Link></li>
            <li><Link href="/contact"><span className="hover:text-primary transition-colors">Contact</span></Link></li>
            <li><Link href="/loyalty"><span className="hover:text-primary transition-colors">Loyalty Program</span></Link></li>
            <li><Link href="/rewards"><span className="hover:text-primary transition-colors">Rewards</span></Link></li>
            <li><Link href="/referral"><span className="hover:text-primary transition-colors">Referral Program</span></Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-4">Socials</h3>
          <div className="flex gap-4">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </Button>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </Button>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </Button>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="hover:text-primary transition-colors">
                <Youtube className="w-5 h-5" />
              </Button>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </Button>
            </a>
          </div>

          <form onSubmit={handleSubscribe} className="space-y-3 text-muted-foreground text-sm mt-6">
            <p>Subscribe to our store for exclusive offers</p>
            <div className="flex gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="border-primary/20 rounded-full"
              />
              <Button
                type="submit"
                variant="secondary"
                className="rounded-full"
              >
                Subscribe
              </Button>
            </div>
          </form>
        </div>
      </div>
    </footer>
  );
}