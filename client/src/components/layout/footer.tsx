import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck } from "lucide-react"; // Assuming this icon is needed


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
    <>
      <footer className="border-t bg-muted/40">
        <div className="container py-8 md:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Trust & Security</h4>
              <ul className="space-y-2 text-sm">
                <li>SSL Secured</li>
                <li>100% Authentic Products</li>
                <li>Verified Supplier</li>
                <li>Money-Back Guarantee</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Certifications</h4>
              <ul className="space-y-2 text-sm">
                <li>ISO 9001:2015</li>
                <li>GMP Certified</li>
                <li>FDA Approved</li>
                <li>Quality Assured</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>24/7 Customer Service</li>
                <li>Expert Consultation</li>
                <li>Secure Payments</li>
                <li>Fast Shipping</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>support@trustmark.com</li>
                <li>+1 (800) 123-4567</li>
                <li>Live Chat Available</li>
                <li>Business Hours: 24/7</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 flex items-center justify-center space-x-4">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">Secure & Trusted Since 2010</span>
          </div>
        </div>
      </footer>
      <footer className="border-t bg-background"> {/*Original Footer Remains, added for email subscription*/}
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:gap-12">

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
    </>
  );
}