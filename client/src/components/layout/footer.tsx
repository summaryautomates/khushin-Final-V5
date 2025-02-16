import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export function Footer() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // TODO: Add actual newsletter subscription logic
    toast({
      title: "Thank you for subscribing!",
      description: "You'll receive our updates at " + email,
    });
    setEmail("");
  };

  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold">Products</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/products/category/lighters">
                  <a className="text-muted-foreground hover:text-foreground">
                    Stylized Lighters
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/products/category/warmers">
                  <a className="text-muted-foreground hover:text-foreground">
                    Winter Warmers
                  </a>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Company</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/about">
                  <a className="text-muted-foreground hover:text-foreground">
                    About Us
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-muted-foreground hover:text-foreground">
                    Contact
                  </a>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Resources</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/blog">
                  <a className="text-muted-foreground hover:text-foreground">
                    Blog
                  </a>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/privacy">
                  <a className="text-muted-foreground hover:text-foreground">
                    Privacy Policy
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <a className="text-muted-foreground hover:text-foreground">
                    Terms of Service
                  </a>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Subscription Section */}
        <div className="mt-12 border-t pt-8">
          <div className="mx-auto max-w-md text-center">
            <h3 className="text-lg font-semibold">Stay Updated</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Subscribe to our newsletter for exclusive offers and updates
            </p>
            <form onSubmit={handleSubscribe} className="mt-4 flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                required
              />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>
        </div>

        <div className="mt-8 border-t pt-8">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} KHUSH.IN. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}