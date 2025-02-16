
export default function Shipping() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Shipping Information</h1>
      <div className="prose prose-invert max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Shipping Methods</h2>
        <div className="space-y-4">
          <div className="border border-zinc-800 p-4 rounded-lg">
            <h3 className="font-semibold">Standard Shipping</h3>
            <p>3-5 business days - $5.99</p>
          </div>
          <div className="border border-zinc-800 p-4 rounded-lg">
            <h3 className="font-semibold">Express Shipping</h3>
            <p>1-2 business days - $12.99</p>
          </div>
          <div className="border border-zinc-800 p-4 rounded-lg">
            <h3 className="font-semibold">International Shipping</h3>
            <p>7-14 business days - Calculated at checkout</p>
          </div>
        </div>
      </div>
    </div>
  );
}
