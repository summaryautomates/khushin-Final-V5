import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function NewsletterDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const hasSeenDialog = localStorage.getItem('hasSeenNewsletterDialog');
    if(hasSeenDialog !== 'true'){
        const timer = setTimeout(() => {
          setOpen(true);
        }, 7000);
    
        return () => clearTimeout(timer);
    }
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Thanks for subscribing!",
      description: "You'll receive your 10% discount code via email shortly.",
    });
    localStorage.setItem('hasSeenNewsletterDialog', 'true');
    setOpen(false);
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          localStorage.setItem('hasSeenNewsletterDialog', 'true');
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px] bg-white text-black">
        <button
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 opacity-70 transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            GET 10% OFF
          </DialogTitle>
        </DialogHeader>
        <div className="text-center space-y-6">
          <h2 className="text-4xl font-serif">Join us</h2>
          <p className="text-lg">
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
            />
            <Button type="submit" className="w-full bg-black text-white hover:bg-black/90">
              Subscribe
            </Button>
          </form>
          <p className="text-xs text-gray-500">
            By completing this form, you are signing up to receive our emails
            and can unsubscribe at any time
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}