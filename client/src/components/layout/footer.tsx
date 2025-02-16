import { useLocation } from "wouter";
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
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Search Section */}
        <div className="mb-12 border-b pb-12">
          <div className="max-w-md mx-auto">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="search"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">Search</Button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:gap-12">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Products</h3>
            <ul className="space-y-3">
              <li className="text-muted-foreground hover:text-foreground cursor-pointer" onClick={() => window.location.href = '/products/category/lighters'}>Stylized Lighters</li>
              <li className="text-muted-foreground hover:text-foreground cursor-pointer" onClick={() => window.location.href = '/products/new'}>New Arrivals</li>
              <li className="text-muted-foreground hover:text-foreground cursor-pointer" onClick={() => window.location.href = '/products/bestsellers'}>Best Sellers</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Contact</h3>
            <ul className="space-y-3">
              <li className="text-muted-foreground hover:text-foreground cursor-pointer" onClick={() => window.location.href = '/contact'}>Contact Us</li>
              <li><p className="text-muted-foreground">WhatsApp Support<br/>+919373395733</p></li>
              <li><p className="text-muted-foreground">Email Support<br/>support@khush.in</p></li>
              <li><p className="text-muted-foreground">Address<br/>123 Fashion Street<br/>Mumbai, India</p></li>
              <li className="text-muted-foreground hover:text-foreground cursor-pointer" onClick={() => window.location.href = '/support'}>Customer Support</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Blog</h3>
            <ul className="space-y-3">
              <li className="text-muted-foreground hover:text-foreground cursor-pointer" onClick={() => window.location.href = '/blog/latest'}>Latest Posts</li>
              <li className="text-muted-foreground hover:text-foreground cursor-pointer" onClick={() => window.location.href = '/blog/guides'}>Style Guides</li>
              <li className="text-muted-foreground hover:text-foreground cursor-pointer" onClick={() => window.location.href = '/blog/collections'}>Collections</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Connect</h3>
            <ul className="space-y-3">
              <li><a href="https://instagram.com" className="text-muted-foreground hover:text-foreground" target="_blank" rel="noopener noreferrer">Instagram</a></li>
              <li><a href="https://facebook.com" className="text-muted-foreground hover:text-foreground" target="_blank" rel="noopener noreferrer">Facebook</a></li>
              <li><a href="mailto:contact@khush.in" className="text-muted-foreground hover:text-foreground">Email Us</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Newsletter</h3>
            <p className="text-sm text-muted-foreground">Subscribe for exclusive offers and updates</p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full">Subscribe</Button>
            </form>
          </div>
        </div>

        <div className="mt-16 border-t pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Sai Abhinandan, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}