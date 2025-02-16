import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Shield, Lock, CreditCard } from "lucide-react";

export function Footer() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [search, setSearch] = useState("");
  const [location] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search) {
      window.location.href = `/products?search=${encodeURIComponent(search)}`;
    }
  };

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
            <li><Link href="/faqs">FAQs</Link></li>
            <li><Link href="/warranty">Warranty</Link></li>
            <li><Link href="/shipping">Shipping</Link></li>
            <li><Link href="/returns">Returns</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-4">Connect</h3>
          <ul className="space-y-2">
            <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a></li>
            <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a></li>
            <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a></li>
            <li><a href="mailto:contact@ignite.co.in">Email</a></li>
            <li><a href="tel:+91-1800-123-4567">Toll Free: 1800-123-4567</a></li>
            <li><a href="https://wa.me/919898989898">WhatsApp Support</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-4">Explore</h3>
          <ul className="space-y-2">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/products">Products</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-4">Legal</h3>
          <p className="text-sm text-gray-400">© 2025 Ignité, Inc.<br/>All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
