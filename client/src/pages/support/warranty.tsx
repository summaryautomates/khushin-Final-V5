import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Shield, Wrench, Clock, AlertCircle } from "lucide-react";

export default function Warranty() {
  return (
    <div className="min-h-screen bg-zinc-950 pt-24">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-extralight text-center mb-12 tracking-wider text-white">Warranty Information</h1>

          <div className="max-w-3xl mx-auto space-y-8">
            <Card className="border-none bg-white/[0.02] backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-light tracking-wide">Lifetime Warranty</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-zinc-300">
                <p>
                  All KHUSH.IN luxury lighters come with a comprehensive lifetime warranty against manufacturing defects, 
                  demonstrating our commitment to quality and customer satisfaction.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none bg-white/[0.02] backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-light tracking-wide">What's Covered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/20 p-3 rounded-lg">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg mb-2">Manufacturing Defects</h3>
                      <p className="text-zinc-400">Any defects in materials or workmanship that affect the product's functionality</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary/20 p-3 rounded-lg">
                      <Wrench className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg mb-2">Mechanical Issues</h3>
                      <p className="text-zinc-400">Problems with internal mechanisms or components under normal use</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary/20 p-3 rounded-lg">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg mb-2">Lifetime Coverage</h3>
                      <p className="text-zinc-400">Our warranty extends for the entire lifetime of the original purchaser</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-white/[0.02] backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-light tracking-wide">What's Not Covered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="bg-primary/20 p-3 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-2">Exclusions</h3>
                    <ul className="list-disc pl-6 space-y-2 text-zinc-400">
                      <li>Normal wear and tear from regular use</li>
                      <li>Accidental damage or drops</li>
                      <li>Unauthorized modifications or repairs</li>
                      <li>Misuse or abuse of the product</li>
                      <li>Cosmetic changes over time</li>
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