import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Users, Link as LinkIcon, Share2, Gift, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  pointsEarned: number;
  referralCode: string;
  history: Array<{
    id: number;
    type: string;
    pointsAwarded: number;
    createdAt: string;
    referredName: string;
  }>;
}

export default function ReferralDashboard() {
  const { toast } = useToast();

  const { data: stats, isLoading } = useQuery<ReferralStats>({
    queryKey: ['/api/referrals/stats'],
    queryFn: async () => {
      // This will be replaced with actual API call
      return {
        totalReferrals: 5,
        activeReferrals: 3,
        pointsEarned: 1500,
        referralCode: "KHUSH123",
        history: [
          {
            id: 1,
            type: "signup",
            pointsAwarded: 500,
            createdAt: "2025-02-22",
            referredName: "John Doe"
          }
        ]
      };
    }
  });

  const copyReferralLink = () => {
    if (!stats?.referralCode) return;
    const link = `https://khush.in/ref/${stats.referralCode}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Referral Link Copied!",
      description: "Share this link with your friends to earn rewards."
    });
  };

  const shareReferral = async () => {
    if (!stats?.referralCode) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join KHUSH.IN',
          text: 'Use my referral code to get started with KHUSH.IN!',
          url: `https://khush.in/ref/${stats.referralCode}`
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      copyReferralLink();
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-black pt-24 flex items-center justify-center">
      <div className="text-xl text-primary/60">Loading your referral dashboard...</div>
    </div>;
  }

  if (!stats) {
    return <div className="min-h-screen bg-black pt-24 flex items-center justify-center">
      <div className="text-xl text-red-500">Failed to load referral data</div>
    </div>;
  }

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
            Referral Program
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <Card className="bg-black/50 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="text-primary" />
                  Total Referrals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-light">{stats.totalReferrals}</div>
              </CardContent>
            </Card>

            <Card className="bg-black/50 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="text-primary" />
                  Active Referrals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-light">{stats.activeReferrals}</div>
              </CardContent>
            </Card>

            <Card className="bg-black/50 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="text-primary" />
                  Points Earned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-light">{stats.pointsEarned}</div>
              </CardContent>
            </Card>

            <Card className="bg-black/50 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="text-primary" />
                  Your Referral Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-mono mb-4">{stats.referralCode}</div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={shareReferral}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-black/50 border-primary/20">
            <CardHeader>
              <CardTitle>Referral History</CardTitle>
              <CardDescription>Track your referral rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.history.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-4 border border-primary/20 rounded-lg">
                    <div>
                      <div className="font-medium">{item.referredName}</div>
                      <div className="text-sm text-zinc-400">{item.type}</div>
                    </div>
                    <div>
                      <div className="text-right font-medium">+{item.pointsAwarded} points</div>
                      <div className="text-sm text-zinc-400">{item.createdAt}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}