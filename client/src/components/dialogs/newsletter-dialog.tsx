import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function NewsletterDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const closeDialog = () => {
    localStorage.setItem('hasSeenNewsletterDialog', 'true');
    setOpen(false);
  };

  useEffect(() => {
    // Reduced timeout to 3 seconds for testing
    const timer = setTimeout(() => {
      const hasSeenDialog = localStorage.getItem('hasSeenNewsletterDialog');
      if (!hasSeenDialog) {
        setOpen(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      // Here you would typically make an API call to subscribe the user
      toast({
        title: "Thanks for subscribing!",
        description: "You'll receive your 10% discount code via email shortly.",
      });
      closeDialog();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px] bg-background p-0 gap-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-center text-2xl font-bold">
            GET 10% OFF
          </DialogTitle>
          <DialogDescription id="newsletter-dialog-description" className="sr-only">
            Sign up for our newsletter to receive a 10% discount on your first purchase
          </DialogDescription>
        </DialogHeader>
        <button
          onClick={closeDialog}
          className="absolute right-4 top-4 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="p-6 pt-2 text-center space-y-4">
          <h2 className="text-4xl font-serif tracking-tight">Join us</h2>
          <p className="text-lg text-muted-foreground">
            Signup and get 10% off your first purchase
          </p>
          <form onSubmit={handleSubscribe} className="space-y-4">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="text-center"
              aria-label="Email address for newsletter"
            />
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              Subscribe Now
            </Button>
          </form>
          <p className="text-xs text-muted-foreground">
            By subscribing, you agree to receive marketing communications from us.
            You can unsubscribe at any time.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}