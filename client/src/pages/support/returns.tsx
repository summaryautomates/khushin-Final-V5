import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Returns() {
  return (
    <div className="min-h-screen bg-zinc-950 pt-24">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-extralight text-center mb-12 tracking-wider text-white">Returns Policy</h1>

          <div className="max-w-3xl mx-auto space-y-8">
            <Card className="border-none bg-white/[0.02] backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-light tracking-wide">Our Commitment to You</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-zinc-300">
                <p>
                  At KHUSH.IN, we stand behind the quality of our products. If you're not completely satisfied with your purchase,
                  we offer a comprehensive 30-day return policy.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none bg-white/[0.02] backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-light tracking-wide">Return Process</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4 text-zinc-300">
                  <li className="flex items-start gap-4">
                    <span className="bg-primary/20 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">1</span>
                    <div>
                      <h3 className="font-medium mb-1">Contact Our Support Team</h3>
                      <p className="text-zinc-400">Reach out to our customer service within 30 days of receiving your order</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="bg-primary/20 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">2</span>
                    <div>
                      <h3 className="font-medium mb-1">Obtain Return Authorization</h3>
                      <p className="text-zinc-400">We'll provide you with a return authorization number and shipping instructions</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="bg-primary/20 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">3</span>
                    <div>
                      <h3 className="font-medium mb-1">Package Your Return</h3>
                      <p className="text-zinc-400">Carefully pack the item in its original packaging with all accessories</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="bg-primary/20 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">4</span>
                    <div>
                      <h3 className="font-medium mb-1">Ship the Item</h3>
                      <p className="text-zinc-400">Use our provided shipping label to return the item to our facility</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="bg-primary/20 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">5</span>
                    <div>
                      <h3 className="font-medium mb-1">Receive Your Refund</h3>
                      <p className="text-zinc-400">Once we receive and inspect the item, we'll process your refund within 5-7 business days</p>
                    </div>
                  </li>
                </ol>
              </CardContent>
            </Card>

            <Card className="border-none bg-white/[0.02] backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-light tracking-wide">Return Conditions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-zinc-300">
                <ul className="list-disc pl-6 space-y-2 text-zinc-400">
                  <li>Item must be unused and in its original condition</li>
                  <li>All original packaging and accessories must be included</li>
                  <li>Proof of purchase is required</li>
                  <li>Customized items are non-returnable unless defective</li>
                  <li>Return shipping costs may apply for non-defective items</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}