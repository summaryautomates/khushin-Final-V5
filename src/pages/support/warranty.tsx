import React from "react";

export const Warranty: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Warranty Information</h1>
      <div className="prose max-w-none">
        <p className="text-lg mb-6">
          All KHUSH.IN products come with a comprehensive warranty to ensure your complete satisfaction and peace of mind.
        </p>
        <div className="bg-background p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Warranty Coverage</h2>
          <ul className="space-y-4">
            <li>Manufacturing defects: 1 year from date of purchase</li>
            <li>Material defects: 6 months from date of purchase</li>
            <li>Embroidery and embellishments: 3 months from date of purchase</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Warranty;
