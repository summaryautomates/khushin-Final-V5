
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Gift, Star, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Rewards() {
  const [rewards, setRewards] = useState([
    {
      id: 1,
      name: "₹500 Off Coupon",
      description: "Get ₹500 off on your next purchase",
      pointsCost: 1000,
      type: 'discount'
    },
    {
      id: 2,
      name: "Free Engraving",
      description: "Get free engraving on any lighter",
      pointsCost: 750,
      type: 'service'
    },
    {
      id: 3,
      name: "VIP Event Access",
      description: "Exclusive access to our next launch event",
      pointsCost: 2000,
      type: 'experience'
    }
  ]);
  
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <h1 className="text-4xl font-extralight text-center mb-12 tracking-wider">
            Rewards Catalog
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {rewards.map((reward) => (
              <Card key={reward.id} className="bg-black/50 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="text-primary" />
                    {reward.name}
                  </CardTitle>
                  <CardDescription>{reward.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-primary" />
                      <span>{reward.pointsCost} points</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-zinc-400">
                      <Clock className="w-4 h-4" />
                      <span>Limited time</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => toast({
                      title: "Redeem Reward",
                      description: "This feature will be available soon!"
                    })}
                  >
                    Redeem Reward
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
