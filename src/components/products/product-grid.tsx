import React from "react";
import { Link } from "wouter";

// Mock data for initial rendering
const mockProducts = [
  {
    id: 1,
    name: "Luxury Silk Saree",
    price: 599.99,
    image: "/products/saree1.jpg",
    category: "Sarees"
  },
  {
    id: 2,
    name: "Designer Lehenga",
    price: 899.99,
    image: "/products/lehenga1.jpg",
    category: "Lehengas"
  },
  {
    id: 3,
    name: "Embroidered Kurta Set",
    price: 299.99,
    image: "/products/kurta1.jpg",
    category: "Kurtas"
  },
  // Add more mock products as needed
];

interface ProductGridProps {
  searchQuery: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ searchQuery }) => {
  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredProducts.map((product) => (
        <Link key={product.id} href={`/product/${product.id}`}>
          <div className="group cursor-pointer">
            <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-square">
              <div className="absolute inset-0 bg-primary/5" />
              <div className="p-4">
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                <p className="font-medium">${product.price}</p>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ProductGrid;
