
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Gift, Award, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Loyalty() {
  const [loyalty, setLoyalty] = useState({
    points: 0,
    tier: 'bronze',
    nextTier: 'silver',
    progress: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    // Fetch loyalty data
    // This would be replaced with actual API call
    setLoyalty({
      points: 750,
      tier: 'bronze',
      nextTier: 'silver',
      progress: 75
    });
  }, []);

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
            Ignité Rewards Program
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="bg-black/50 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="text-primary" />
                  Your Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-light mb-4">{loyalty.tier}</div>
                <Progress value={loyalty.progress} className="mb-2" />
                <p className="text-sm text-zinc-400">
                  {1000 - loyalty.points} points until {loyalty.nextTier}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/50 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="text-primary" />
                  Points Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-light mb-4">
                  {loyalty.points} points
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => toast({
                    title: "Coming Soon",
                    description: "Redeem points feature will be available soon!"
                  })}
                >
                  Redeem Points
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-black/50 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="text-primary" />
                  Refer & Earn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Share and earn 500 points per referral</p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => toast({
                    title: "Referral Link Copied",
                    description: "Share this link with your friends!"
                  })}
                >
                  Get Referral Link
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
