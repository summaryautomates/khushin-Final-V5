import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Truck, Clock, Globe, Shield } from "lucide-react";

export default function Shipping() {
  return (
    <div className="min-h-screen bg-zinc-950 pt-24">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-extralight text-center mb-12 tracking-wider text-white">Shipping Information</h1>

          <div className="max-w-3xl mx-auto space-y-8">
            <Card className="border-none bg-white/[0.02] backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-light tracking-wide">Shipping Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/20 p-3 rounded-lg">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg mb-2">Standard Shipping</h3>
                      <p className="text-zinc-400">3-5 business days</p>
                      <p className="text-zinc-300 font-medium mt-1">$5.99</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary/20 p-3 rounded-lg">
                      <Truck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg mb-2">Express Shipping</h3>
                      <p className="text-zinc-400">1-2 business days</p>
                      <p className="text-zinc-300 font-medium mt-1">$12.99</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary/20 p-3 rounded-lg">
                      <Globe className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg mb-2">International Shipping</h3>
                      <p className="text-zinc-400">7-14 business days</p>
                      <p className="text-zinc-300 font-medium mt-1">Calculated at checkout</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-white/[0.02] backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-light tracking-wide">Shipping Policies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/20 p-3 rounded-lg">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-2">Our Guarantee</h3>
                    <ul className="list-disc pl-6 space-y-2 text-zinc-400">
                      <li>All orders are insured and tracked</li>
                      <li>Free shipping on orders over $200</li>
                      <li>Signature required for valuable items</li>
                      <li>Real-time tracking updates</li>
                      <li>Premium packaging for protection</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}