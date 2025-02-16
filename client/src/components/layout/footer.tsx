
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Shield, Lock, CreditCard } from "lucide-react";

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
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Trust Badges Section */}
        <div className="mb-12 border-b pb-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="flex items-center justify-center space-x-4">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h4 className="font-semibold">Secure Shopping</h4>
                <p className="text-sm text-muted-foreground">256-bit SSL Security</p>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-4">
              <Lock className="h-8 w-8 text-primary" />
              <div>
                <h4 className="font-semibold">Privacy Protected</h4>
                <p className="text-sm text-muted-foreground">GDPR Compliant</p>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-4">
              <CreditCard className="h-8 w-8 text-primary" />
              <div>
                <h4 className="font-semibold">Secure Payments</h4>
                <p className="text-sm text-muted-foreground">PCI DSS Compliant</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-5 lg:gap-12">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Support</h3>
            <ul className="space-y-3">
              <li><Link href="/faqs" className="text-muted-foreground hover:text-foreground">FAQs</Link></li>
              <li><Link href="/warranty" className="text-muted-foreground hover:text-foreground">Warranty</Link></li>
              <li><Link href="/shipping" className="text-muted-foreground hover:text-foreground">Shipping</Link></li>
              <li><Link href="/returns" className="text-muted-foreground hover:text-foreground">Returns</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Connect</h3>
            <ul className="space-y-3">
              <li><a href="https://instagram.com" className="text-muted-foreground hover:text-foreground" target="_blank" rel="noopener noreferrer">Instagram</a></li>
              <li><a href="https://facebook.com" className="text-muted-foreground hover:text-foreground" target="_blank" rel="noopener noreferrer">Facebook</a></li>
              <li><a href="https://twitter.com" className="text-muted-foreground hover:text-foreground" target="_blank" rel="noopener noreferrer">Twitter</a></li>
              <li><a href="mailto:contact@khush.in" className="text-muted-foreground hover:text-foreground">Email</a></li>
              <li><p className="text-muted-foreground">Toll Free - WhatsApp Support<br/>+919373395733</p></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Explore</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-muted-foreground hover:text-foreground">Home</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-foreground">About</Link></li>
              <li><Link href="/products" className="text-muted-foreground hover:text-foreground">Products</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
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
