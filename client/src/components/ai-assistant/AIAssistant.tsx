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
        // Simulate AI response for now since we don't have a real AI endpoint
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        
        // Generate a simple response based on the message content
        let response = "I'm sorry, I don't have enough information to answer that question.";
        
        if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
          response = "Hello! How can I help you with your shopping today?";
        } else if (message.toLowerCase().includes('product') || message.toLowerCase().includes('lighter')) {
          response = "We have a wide range of luxury lighters and flasks. Our premium collection features gold-plated designs with lifetime warranties. Would you like to see our bestsellers?";
        } else if (message.toLowerCase().includes('price') || message.toLowerCase().includes('cost')) {
          response = "Our products range from ₹14,999 for standard lighters to ₹29,999 for premium luxury designs. All prices include free shipping on orders over ₹5,000.";
        } else if (message.toLowerCase().includes('delivery') || message.toLowerCase().includes('shipping')) {
          response = "We offer express delivery within 24 hours in major cities, and standard delivery within 3-5 business days nationwide. You can track your order in real-time through your account.";
        } else if (message.toLowerCase().includes('refund') || message.toLowerCase().includes('return')) {
          response = "We have a 30-day return policy for all unused products in their original packaging. For customized items, please contact our customer service team.";
        }
        
        return { message: response };
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