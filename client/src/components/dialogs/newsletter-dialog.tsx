import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Mail, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function NewsletterDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    console.log('NewsletterDialog mounted'); // Debug mount

    // Check localStorage immediately
    const hasSeenDialog = localStorage.getItem('hasSeenNewsletterDialog');
    console.log('Initial hasSeenDialog:', hasSeenDialog); // Debug localStorage

    const timer = setTimeout(() => {
      const currentHasSeenDialog = localStorage.getItem('hasSeenNewsletterDialog');
      console.log('Timer executed, currentHasSeenDialog:', currentHasSeenDialog); // Debug timer

      if (!currentHasSeenDialog) {
        console.log('Opening newsletter dialog...'); // Debug opening
        setOpen(true);
      }
    }, 7000);

    return () => {
      console.log('Cleaning up timer'); // Debug cleanup
      clearTimeout(timer);
    };
  }, []);

  const closeDialog = () => {
    console.log('Closing dialog and setting localStorage flag'); // Debug close
    localStorage.setItem('hasSeenNewsletterDialog', 'true');
    setOpen(false);
  };

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
      <DialogContent 
        className="sm:max-w-[425px] h-auto overflow-y-auto sm:rounded-lg bg-gradient-to-br from-background/95 via-background/98 to-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 border border-primary/20"
        aria-describedby="newsletter-dialog-description"
      >
        <div className="relative p-6">
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
            <Sparkles className="w-8 h-8 mx-auto text-primary animate-pulse" />
            <DialogTitle className="text-3xl font-light tracking-tight">
              Special Offer
            </DialogTitle>
            <DialogDescription id="newsletter-dialog-description">
              Subscribe to our newsletter and get 10% off your first purchase!
            </DialogDescription>

            <form onSubmit={handleSubscribe} className="space-y-4 mt-6">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus:border-primary/50 transition-all duration-200"
                  aria-label="Email address for newsletter"
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Get My 10% Off
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