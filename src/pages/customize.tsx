import React from "react";
import { Button } from "@/components/ui/button";

export const Customize: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Customize Your Style</h1>
      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="bg-primary/5 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Personal Measurements</h2>
            <p className="text-muted-foreground mb-4">
              Get the perfect fit with our customization service. Provide your measurements and preferences for a truly unique piece.
            </p>
            <Button>Schedule Consultation</Button>
          </div>
          
          <div className="bg-primary/5 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Design Consultation</h2>
            <p className="text-muted-foreground mb-4">
              Work with our expert designers to create your dream outfit. From fabric selection to embellishments, make it truly yours.
            </p>
            <Button variant="outline">Book Designer</Button>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-primary/5 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
            <ol className="space-y-4 list-decimal list-inside text-muted-foreground">
              <li>Schedule a consultation with our design team</li>
              <li>Share your vision and preferences</li>
              <li>Receive personalized design options</li>
              <li>Select materials and embellishments</li>
              <li>Get fitted by our expert tailors</li>
              <li>Receive your custom creation</li>
            </ol>
          </div>
          
          <div className="bg-primary/5 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Customization Options</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Custom embroidery designs</li>
              <li>• Premium fabric selection</li>
              <li>• Personalized color combinations</li>
              <li>• Bespoke fitting services</li>
              <li>• Exclusive embellishments</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customize;
