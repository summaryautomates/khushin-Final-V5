interface Specification {
  title: string;
  description: string;
}

interface ProductFeaturesProps {
  specifications: Specification[];
}

export default function ProductFeatures({ specifications }: ProductFeaturesProps) {
  return (
    <div className="bg-[#0A0A0A] rounded-lg p-8 mt-12 border border-gray-800">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {specifications.map((spec, index) => (
          <div key={index}>
            <h3 className="text-white font-medium mb-3">{spec.title}</h3>
            <p className="text-gray-300 text-sm">{spec.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
