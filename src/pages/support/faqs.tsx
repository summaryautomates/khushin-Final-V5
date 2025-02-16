import React from "react";

export const FAQs: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Frequently Asked Questions</h1>
      <div className="space-y-6">
        <div className="bg-background p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">What materials do you use?</h3>
          <p className="text-muted-foreground">
            We source only the finest materials from trusted suppliers, ensuring every piece meets our high standards of quality and sustainability.
          </p>
        </div>
        <div className="bg-background p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">How long does shipping take?</h3>
          <p className="text-muted-foreground">
            Domestic orders typically arrive within 3-5 business days. International shipping times vary by location, usually taking 7-14 business days.
          </p>
        </div>
        <div className="bg-background p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Do you offer customization?</h3>
          <p className="text-muted-foreground">
            Yes, we offer customization services for select pieces. Visit our customization page to explore the options available.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FAQs;
