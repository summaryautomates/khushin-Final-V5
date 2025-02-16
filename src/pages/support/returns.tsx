import React from "react";

export const Returns: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Returns Policy</h1>
      <div className="prose max-w-none">
        <p className="text-lg mb-6">
          We want you to be completely satisfied with your KHUSH.IN purchase. If you're not happy with your order, we accept returns within 30 days of delivery.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">Return Guidelines</h2>
        <ul className="space-y-4">
          <li>Items must be unworn and in original condition with all tags attached</li>
          <li>Original packaging must be included</li>
          <li>A completed return form must accompany your return</li>
        </ul>
      </div>
    </div>
  );
};

export default Returns;
