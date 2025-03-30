import { useParams } from "wouter";
import ProductDetail from "@/components/ui/product-detail";
import ProductFeatures from "@/components/ui/product-features";

export default function ProductPage() {
  const { id } = useParams() || { id: '5' }; // Default to ID 5 if none provided
  
  // Normally, you would fetch the product data from an API
  // For now, we'll use a hardcoded product for demonstration
  const product = {
    id,
    name: "Luxury Lighter Collection",
    price: "$299.00",
    description: "Experience the epitome of luxury with our meticulously crafted lighters. Made from premium materials and designed with precision, our lighters combine functionality with sophisticated style.",
    imageUrl: "https://images.unsplash.com/photo-1621354694687-eac0b7ea54b7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=800&q=80",
    deliveryInfo: {
      express: true,
      eta: "Tomorrow",
    },
    features: [
      {
        icon: "gift",
        text: "Premium gift box included",
      },
      {
        icon: "badge-check",
        text: "100% genuine products",
      },
      {
        icon: "truck",
        text: "Ships within 24 hours",
      },
      {
        icon: "arrow-down-circle",
        text: "30-day hassle-free returns",
      },
    ],
    specifications: [
      {
        title: "Premium quality materials",
        description: "Sourced from the finest locations.",
      },
      {
        title: "D × 4 × 2 (in) H × W × 1.0",
        description: "150g - lightweight and easy to carry",
      },
      {
        title: "Proudly crafted in India by",
        description: "Skilled artisans",
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image Section */}
        <div className="overflow-hidden">
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-auto object-cover rounded-lg"
          />
        </div>
        
        {/* Product Details Section */}
        <ProductDetail product={product} />
      </div>
      
      {/* Product Features Section */}
      <ProductFeatures specifications={product.specifications} />
    </div>
  );
}
