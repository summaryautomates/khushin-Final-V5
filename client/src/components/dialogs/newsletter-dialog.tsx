import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Mail, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function NewsletterDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const hasSeenDialog = localStorage.getItem('hasSeenNewsletterDialog');

    if (!hasSeenDialog) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, 7000);

      return () => clearTimeout(timer);
    }
  }, []);

  const closeDialog = () => {
    localStorage.setItem('hasSeenNewsletterDialog', 'true');
    setOpen(false);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!email) {
        throw new Error("Please enter your email address.");
      }

      if (!validateEmail(email)) {
        throw new Error("Please enter a valid email address.");
      }

      setIsLoading(true);

      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Subscription failed. Please try again later.');
      }

      toast({
        title: "Thanks for subscribing!",
        description: "You'll receive your 10% discount code via email shortly.",
      });
      closeDialog();
    } catch (error) {
      toast({
        title: "Subscription Failed",
        description: error instanceof Error ? error.message : "Unable to subscribe at this time. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent 
        className="sm:max-w-[425px] h-auto overflow-y-auto sm:rounded-lg bg-gradient-to-br from-background/95 via-background/98 to-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 border border-primary/20"
      >
        <div className="relative p-6">
          <DialogTitle className="text-3xl font-light tracking-tight text-center">
            Special Offer
          </DialogTitle>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={closeDialog} 
            className="absolute right-4 top-4 hover:bg-background/80 transition-colors duration-200" 
            aria-label="Close newsletter popup"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="text-center space-y-4">
            <Sparkles className="w-8 h-8 mx-auto text-primary animate-pulse" aria-hidden="true" />

            <DialogDescription className="text-base">
              Subscribe to our newsletter and get 10% off your first purchase!
            </DialogDescription>

            <form onSubmit={handleSubscribe} className="space-y-4 mt-6">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus:border-primary/50 transition-all duration-200"
                  aria-label="Email address for newsletter subscription"
                  disabled={isLoading}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  "Get My 10% Off"
                )}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground mt-4">
              By subscribing, you agree to receive marketing communications from us.
              You can unsubscribe at any time.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}