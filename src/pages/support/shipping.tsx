import React from "react";

export const Shipping: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Shipping Information</h1>
      <div className="prose max-w-none">
        <h2 className="text-2xl font-semibold mt-8 mb-4">Delivery Options</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-background p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Standard Shipping</h3>
            <p>3-5 business days</p>
            <p className="text-muted-foreground">Free for orders over ₹5000</p>
          </div>
          <div className="bg-background p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Express Shipping</h3>
            <p>1-2 business days</p>
            <p className="text-muted-foreground">Additional charges apply</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
