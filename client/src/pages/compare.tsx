import { useCompare } from "@/hooks/use-compare";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/products";
import { X, ShoppingCart, AlertCircle } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export default function ComparePage() {
  const { items, removeItem, clearItems } = useCompare();
  const { addItem } = useCart();
  const { toast } = useToast();

  if (items.length === 0) {
    return (
      <div className="container py-12">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold mb-4">Product Comparison</h1>
          <p className="text-muted-foreground">No products selected for comparison.</p>
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
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

  const compareAttributes = [
    { label: "Image", key: "image" },
    { label: "Name", key: "name" },
    { label: "Price", key: "price" },
    { label: "Category", key: "category" },
    { label: "Description", key: "description" },
  ];

  return (
    <div className="container py-12">
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Product Comparison</h1>
          <p className="text-sm text-muted-foreground">
            Comparing {items.length} {items.length === 1 ? 'product' : 'products'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => clearItems()}>
            Clear All
          </Button>
          <Link href="/products">
            <Button>Add More</Button>
          </Link>
        </div>
      </div>

      {items.length >= 4 && (
        <div className="mb-6 flex items-center gap-2 p-4 text-amber-600 bg-amber-500/10 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm">Maximum of 4 products can be compared at once.</p>
        </div>
      )}

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

            {/* Comparison rows */}
            {compareAttributes.map(({ label, key }) => (
              <>
                <div className="font-medium py-4">{label}</div>
                {items.map((product) => (
                  <div key={`${key}-${product.id}`} className="py-4">
                    {key === "image" ? (
                      <div className="aspect-square bg-zinc-100 rounded-lg overflow-hidden">
                        <img
                          src={Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '/placeholder-product.svg'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : key === "price" ? (
                      <span className="font-semibold text-primary">
                        {formatPrice(product[key])}
                      </span>
                    ) : key === "category" ? (
                      <Badge variant="secondary">{product[key]}</Badge>
                    ) : (
                      <span>{product[key]}</span>
                    )}
                  </div>
                ))}
              </>
            ))}


            {items.map((product) => (
              <div key={`action-${product.id}`}>
                <Button
                  onClick={() => handleAddToCart(product)}
                  className="w-full gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
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