
export default function Returns() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Returns Policy</h1>
      <div className="prose prose-invert max-w-3xl mx-auto">
        <p className="text-lg mb-6">
          We want you to be completely satisfied with your purchase. If you're not happy with your order, you can return it within 30 days.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">Return Process</h2>
        <ol className="list-decimal pl-6 mb-6 space-y-2">
          <li>Contact our support team</li>
          <li>Receive a return authorization number</li>
          <li>Pack the item in its original packaging</li>
          <li>Ship the item back to us</li>
          <li>Receive your refund within 5-7 business days of receipt</li>
        </ol>
      </div>
    </div>
  );
}
