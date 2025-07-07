import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MessageCircle, Loader2, Bot, User, AlertCircle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

export const AIAssistant = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();

  const askAI = useMutation({
    mutationFn: async (message: string) => {
      try {
        // Check if we're in a deployment environment
        const isDeployment = typeof window !== 'undefined' && 
                            !window.location.hostname.includes('localhost') && 
                            !window.location.hostname.includes('127.0.0.1');
                            
        if (isDeployment) {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Generate a simple response based on the message content
          let response = "I'm here to help with your shopping experience at KHUSH.IN. Feel free to ask about our luxury lighters, flasks, or any other products.";
          
          if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
            response = "Hello! Welcome to KHUSH.IN. How can I assist you with your luxury shopping experience today?";
          } else if (message.toLowerCase().includes('product') || message.toLowerCase().includes('lighter')) {
            response = "Our luxury lighter collection features premium materials like gold-plated brass and sterling silver. Each piece comes with a lifetime warranty and free refills for the first year. Our prices range from ₹14,999 to ₹29,999 depending on the model and customization options.";
          } else if (message.toLowerCase().includes('price') || message.toLowerCase().includes('cost')) {
            response = "Our luxury lighters range from ₹14,999 for the Silver Pocket model to ₹29,999 for the Gold Edition. Premium flasks start at ₹12,999. All prices include complimentary gift wrapping and free shipping on orders over ₹5,000.";
          } else if (message.toLowerCase().includes('delivery') || message.toLowerCase().includes('shipping')) {
            response = "We offer express delivery within 24 hours in Mumbai, Delhi, and Bangalore. Standard delivery takes 3-5 business days nationwide. International shipping is available to select countries. All shipments are fully insured and trackable in real-time.";
          } else if (message.toLowerCase().includes('refund') || message.toLowerCase().includes('return')) {
            response = "We have a 30-day hassle-free return policy for all unused products in their original packaging. For customized items, please contact our VIP customer service team at support@khush.in for personalized assistance.";
          } else if (message.toLowerCase().includes('flask')) {
            response = "Our premium flask collection includes stainless steel flasks with leather wrapping, available in various sizes from 6oz to 12oz. Prices start at ₹12,999 and include optional personalized engraving. Each flask comes with a 5-year warranty against leaks.";
          } else if (message.toLowerCase().includes('customize') || message.toLowerCase().includes('engraving')) {
            response = "We offer personalized engraving on most of our products. You can add names, dates, or custom messages. For luxury lighters, we also offer custom designs and premium materials. The customization process takes 2-3 business days in addition to standard shipping time.";
          } else if (message.toLowerCase().includes('warranty')) {
            response = "All our luxury lighters come with a lifetime warranty against manufacturing defects. Premium flasks have a 5-year warranty. We also offer a complimentary maintenance service for lighters purchased from us - just bring them to any of our stores once a year.";
          }
          
          return { message: response };
        }
        
        // Try the real API if not on Netlify
        try {
          const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ message })
          });

          if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to get AI response' }));
            throw new Error(error.message || "Failed to get AI response");
          }
        
          return await response.json();
        } catch (apiError) {
          console.error('API request failed, using fallback response:', apiError);
          
          // Fallback response if API fails
          return { 
            message: "I'm here to help with your shopping experience. Our luxury lighters and flasks are crafted with premium materials and come with extended warranties. How can I assist you today?" 
          };
        }
      } catch (error) {
        console.error('AI Chat Error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, 
        { role: 'assistant', content: data.message }
      ]);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to get AI response",
      });
      setMessages(prev => [...prev,
        { role: 'assistant', content: "I apologize, but I'm having trouble responding right now. Please try again later." }
      ]);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: input }]);
    askAI.mutate(input);
    setInput('');
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="fixed bottom-4 right-4 h-12 w-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 z-50"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            KHUSH.IN AI Assistant
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-[calc(100vh-150px)]">
          <ScrollArea className="flex-1 px-4 py-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                Hi! I'm your shopping assistant. Ask me anything about our products or services.
              </div>
            )}
            {messages.map((msg, i) => (
              <Card 
                key={i} 
                className={cn(
                  "mb-4 p-4",
                  msg.role === 'assistant' 
                    ? "bg-primary/10 ml-4" 
                    : "bg-muted mr-4"
                )}
              >
                <div className="flex items-start gap-2">
                  {msg.role === 'assistant' ? (
                    <Bot className="h-5 w-5 mt-1" />
                  ) : (
                    <User className="h-5 w-5 mt-1" />
                  )}
                  <p className="text-sm">{msg.content}</p>
                </div>
              </Card>
            ))}
            {askAI.isPending && (
              <div className="flex items-center gap-2 text-muted-foreground ml-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            )}
            {askAI.isError && (
              <div className="flex items-center gap-2 text-destructive ml-4">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Error: {askAI.error?.message}</span>
              </div>
            )}
          </ScrollArea>
          <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about our products..."
              className="flex-1"
              disabled={askAI.isPending}
            />
            <Button type="submit" disabled={askAI.isPending}>
              Send
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
};