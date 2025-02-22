import { useCompare } from "@/hooks/use-compare";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/products";
import { X, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ComparePage() {
  const { items, removeItem, clearItems } = useCompare();
  const { addItem } = useCart();
  const { toast } = useToast();

  if (items.length === 0) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Comparison</h1>
          <p className="text-muted-foreground">No products selected for comparison.</p>
        </div>
      </div>
    );
  }

  const handleAddToCart = async (product: typeof items[0]) => {
    try {
      await addItem(product);
      toast({
        description: `${product.name} added to cart`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to add item to cart",
      });
    }
  };

  return (
    <div className="container py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Product Comparison</h1>
        <Button variant="outline" onClick={() => clearItems()}>Clear All</Button>
      </div>

      <ScrollArea className="w-full">
        <div className="min-w-full inline-block">
          <div className="grid grid-cols-[200px_repeat(auto-fit,minmax(250px,1fr))] gap-4">
            {/* Headers */}
            <div className="font-semibold">Features</div>
            {items.map((product) => (
              <div key={product.id} className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -top-2 -right-2"
                  onClick={() => removeItem(product.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {/* Images */}
            <div>Image</div>
            {items.map((product) => (
              <div key={`img-${product.id}`} className="aspect-square bg-zinc-100 rounded-lg overflow-hidden">
                <img
                  src={Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '/placeholder-product.svg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}

            {/* Names */}
            <div>Name</div>
            {items.map((product) => (
              <div key={`name-${product.id}`} className="font-medium">
                {product.name}
              </div>
            ))}

            {/* Price */}
            <div>Price</div>
            {items.map((product) => (
              <div key={`price-${product.id}`} className="font-semibold text-primary">
                {formatPrice(product.price)}
              </div>
            ))}

            {/* Category */}
            <div>Category</div>
            {items.map((product) => (
              <div key={`cat-${product.id}`} className="capitalize">
                {product.category}
              </div>
            ))}

            {/* Description */}
            <div>Description</div>
            {items.map((product) => (
              <div key={`desc-${product.id}`} className="text-sm text-muted-foreground">
                {product.description}
              </div>
            ))}

            {/* Add to Cart */}
            <div></div>
            {items.map((product) => (
              <div key={`action-${product.id}`}>
                <Button
                  onClick={() => handleAddToCart(product)}
                  className="w-full"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
