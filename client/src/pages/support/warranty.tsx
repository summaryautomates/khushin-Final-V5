
export default function Warranty() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Warranty Information</h1>
      <div className="prose prose-invert max-w-3xl mx-auto">
        <p className="text-lg mb-6">
          All Ignité lighters come with a lifetime warranty against manufacturing defects.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">What's Covered</h2>
        <ul className="list-disc pl-6 mb-6">
          <li>Manufacturing defects</li>
          <li>Mechanical failures</li>
          <li>Material defects</li>
        </ul>
        <h2 className="text-2xl font-semibold mt-8 mb-4">What's Not Covered</h2>
        <ul className="list-disc pl-6 mb-6">
          <li>Normal wear and tear</li>
          <li>Accidental damage</li>
          <li>Misuse or abuse</li>
        </ul>
      </div>
    </div>
  );
}
