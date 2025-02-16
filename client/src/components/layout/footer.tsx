
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

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:gap-12">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Products</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/products/category/lighters" className="text-muted-foreground transition-colors hover:text-foreground">
                  Stylized Lighters
                </Link>
              </li>
              <li>
                <Link href="/products/category/warmers" className="text-muted-foreground transition-colors hover:text-foreground">
                  Winter Warmers
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-muted-foreground transition-colors hover:text-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground transition-colors hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/shipping" className="text-muted-foreground transition-colors hover:text-foreground">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-muted-foreground transition-colors hover:text-foreground">
                  Returns Policy
                </Link>
              </li>
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
            © {new Date().getFullYear()} KHUSH.IN. All rights reserved. Est. 2023
          </p>
        </div>
      </div>
    </footer>
  );
}
