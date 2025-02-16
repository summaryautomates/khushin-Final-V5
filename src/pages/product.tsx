import React from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";

export const Product: React.FC = () => {
  const [, params] = useRoute("/product/:id");
  const productId = params?.id;

  // Mock product data - this would normally come from an API
  const product = {
    id: productId,
    name: "Luxury Silk Saree",
    price: 599.99,
    description: "Handcrafted with the finest silk, this saree features intricate traditional designs with modern elements.",
    sizes: ["Small", "Medium", "Large"],
    colors: ["Royal Blue", "Deep Red", "Emerald Green"],
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative aspect-square bg-primary/5 rounded-lg">
          {/* Product image placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-muted-foreground">Product Image</span>
          </div>
        </div>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-2xl font-semibold">${product.price}</p>
          <p className="text-muted-foreground">{product.description}</p>
          
          <div>
            <h3 className="font-semibold mb-2">Size</h3>
            <div className="flex gap-2">
              {product.sizes.map((size) => (
                <Button key={size} variant="outline" className="min-w-[80px]">
                  {size}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Color</h3>
            <div className="flex gap-2">
              {product.colors.map((color) => (
                <Button key={color} variant="outline" className="min-w-[120px]">
                  {color}
                </Button>
              ))}
            </div>
          </div>
          
          <Button size="lg" className="w-full">Add to Cart</Button>
        </div>
      </div>
    </div>
  );
};

export default Product;
