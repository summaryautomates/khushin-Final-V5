import React from "react";
import ProductGrid from "@/components/products/product-grid";

export const Products: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState("");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Our Collection</h1>
      <div className="max-w-xl mx-auto mb-12">
        <input
          type="search"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 rounded-md border border-input"
        />
      </div>
      <ProductGrid searchQuery={searchQuery} />
    </div>
  );
};

export default Products;
