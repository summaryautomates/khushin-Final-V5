import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FAQs() {
  return (
    <div className="min-h-screen bg-zinc-950 pt-24">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-extralight text-center mb-12 tracking-wider text-white">Frequently Asked Questions</h1>

          <div className="max-w-3xl mx-auto space-y-8">
            <Card className="border-none bg-white/[0.02] backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-light tracking-wide">Product Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Are your lighters refillable?</AccordionTrigger>
                    <AccordionContent>
                      Yes, all our luxury lighters are refillable and come with detailed refilling instructions. We recommend using premium butane fuel for optimal performance.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>What materials are used in your lighters?</AccordionTrigger>
                    <AccordionContent>
                      Our lighters are crafted from premium materials including surgical-grade stainless steel, precious metals, and genuine leather accents. Each piece is meticulously finished by hand.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Can I get my lighter engraved?</AccordionTrigger>
                    <AccordionContent>
                      Yes, we offer custom engraving services for all our luxury lighters. You can choose from various fonts and designs during the customization process.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <Card className="border-none bg-white/[0.02] backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-light tracking-wide">Orders & Shipping</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-4">
                    <AccordionTrigger>How long does shipping take?</AccordionTrigger>
                    <AccordionContent>
                      Standard shipping takes 3-5 business days within India. Express shipping (1-2 business days) is available for urgent orders. International shipping typically takes 7-14 business days.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-5">
                    <AccordionTrigger>Do you offer international shipping?</AccordionTrigger>
                    <AccordionContent>
                      Yes, we ship worldwide. International shipping costs are calculated at checkout based on your location and chosen shipping method.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-6">
                    <AccordionTrigger>How are orders packaged?</AccordionTrigger>
                    <AccordionContent>
                      Each lighter comes in a premium presentation box with a certificate of authenticity. Orders are carefully packaged to ensure safe delivery.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <Card className="border-none bg-white/[0.02] backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-light tracking-wide">Returns & Warranty</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-7">
                    <AccordionTrigger>What is your return policy?</AccordionTrigger>
                    <AccordionContent>
                      We offer a 30-day return policy for unused items in their original packaging. Please see our Returns page for detailed information.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-8">
                    <AccordionTrigger>How do I claim warranty?</AccordionTrigger>
                    <AccordionContent>
                      Contact our customer service team with your order details and description of the issue. We'll guide you through the warranty claim process.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-9">
                    <AccordionTrigger>Do you offer repairs?</AccordionTrigger>
                    <AccordionContent>
                      Yes, we provide repair services for all our products. Warranty repairs are free of charge, while out-of-warranty repairs are quoted on a case-by-case basis.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}