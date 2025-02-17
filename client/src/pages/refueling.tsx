
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplet, Zap, Shield, Settings } from "lucide-react";

export default function Refueling() {
  return (
    <div className="container py-12">
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-extralight tracking-wider mb-4">Refueling Solutions</h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
            Experience the perfect blend of convenience and reliability with our premium refueling solutions. 
            Each refill is carefully engineered to maintain the integrity of your luxury lighter.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white/[0.02] backdrop-blur-sm border-none">
            <CardHeader>
              <Droplet className="w-8 h-8 mb-2 text-primary" />
              <CardTitle className="text-xl font-light">Premium Butane</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Ultra-refined butane fuel specially formulated for luxury lighters.</p>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.02] backdrop-blur-sm border-none">
            <CardHeader>
              <Zap className="w-8 h-8 mb-2 text-primary" />
              <CardTitle className="text-xl font-light">Quick Refill</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Efficient refilling system designed for ease and speed.</p>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.02] backdrop-blur-sm border-none">
            <CardHeader>
              <Shield className="w-8 h-8 mb-2 text-primary" />
              <CardTitle className="text-xl font-light">Safety First</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Built-in safety mechanisms for secure and controlled refilling.</p>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.02] backdrop-blur-sm border-none">
            <CardHeader>
              <Settings className="w-8 h-8 mb-2 text-primary" />
              <CardTitle className="text-xl font-light">Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Complete maintenance kit for optimal lighter performance.</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-light">Refueling Guide</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-white/[0.02] backdrop-blur-sm border-none">
              <CardContent className="p-6">
                <ol className="list-decimal list-inside space-y-4 text-muted-foreground">
                  <li>Turn the lighter upside down</li>
                  <li>Locate the refill valve at the bottom</li>
                  <li>Press the fuel canister nozzle firmly into the valve</li>
                  <li>Hold for 5-10 seconds until full</li>
                  <li>Wait 2 minutes before use</li>
                </ol>
              </CardContent>
            </Card>
            
            <Card className="bg-white/[0.02] backdrop-blur-sm border-none">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Safety Precautions</h3>
                <ul className="list-disc list-inside space-y-4 text-muted-foreground">
                  <li>Refill in a well-ventilated area</li>
                  <li>Keep away from open flames</li>
                  <li>Use only premium butane fuel</li>
                  <li>Don't overfill</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" className="font-light tracking-wider">
            Shop Refueling Accessories
          </Button>
        </div>
      </div>
    </div>
  );
}
