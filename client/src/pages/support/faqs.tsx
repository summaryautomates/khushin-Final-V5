
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FAQs() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Frequently Asked Questions</h1>
      <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
        <AccordionItem value="item-1">
          <AccordionTrigger>How long does shipping take?</AccordionTrigger>
          <AccordionContent>
            Shipping typically takes 3-5 business days within the continental United States.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>What is your return policy?</AccordionTrigger>
          <AccordionContent>
            We offer a 30-day return policy for unused items in their original packaging.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Are your lighters refillable?</AccordionTrigger>
          <AccordionContent>
            Yes, all our lighters are refillable and come with detailed refilling instructions.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
