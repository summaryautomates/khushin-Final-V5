import { useCompare } from "@/hooks/use-compare";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/products";
import { X, ShoppingCart, AlertCircle, Check, Minus } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

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

  // Group comparison attributes for better organization
  const compareGroups = [
    {
      title: "Basic Information",
      attributes: [
        { label: "Image", key: "image", type: "image" },
        { label: "Name", key: "name", type: "text" },
        { label: "Price", key: "price", type: "price" },
        { label: "Category", key: "category", type: "badge" },
      ]
    },
    {
      title: "Details",
      attributes: [
        { label: "Description", key: "description", type: "text" },
        { label: "Features", key: "features", type: "features" },
      ]
    }
  ];

  // Function to determine if a value is different from others
  const isDifferent = (key: string, value: any, index: number) => {
    return items.some((item, i) => i !== index && item[key] !== value);
  };

  // Function to render comparison cell based on type
  const renderCell = (attribute: any, product: any, index: number) => {
    const value = product[attribute.key];
    const different = isDifferent(attribute.key, value, index);

    const cellClasses = cn(
      "py-4 px-4",
      different && "bg-primary/5"
    );

    switch (attribute.type) {
      case "image":
        return (
          <div className={cellClasses}>
            <div className="aspect-square bg-zinc-100 rounded-lg overflow-hidden">
              <img
                src={Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '/placeholder-product.svg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        );
      case "price":
        return (
          <div className={cellClasses}>
            <span className="font-semibold text-primary">
              {formatPrice(value)}
            </span>
          </div>
        );
      case "badge":
        return (
          <div className={cellClasses}>
            <Badge variant="secondary">{value}</Badge>
          </div>
        );
      case "features":
        if (!value || !Array.isArray(value)) return <div className={cellClasses}>-</div>;
        return (
          <div className={cellClasses}>
            <ul className="list-none space-y-2">
              {value.map((feature: string, i: number) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      default:
        return (
          <div className={cellClasses}>
            {value || <Minus className="h-4 w-4 text-muted-foreground" />}
          </div>
        );
    }
  };

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
          <div className="border rounded-lg overflow-hidden">
            {compareGroups.map((group) => (
              <div key={group.title} className="divide-y">
                <div className="bg-muted/50 px-4 py-2 font-semibold text-sm">
                  {group.title}
                </div>
                {group.attributes.map((attribute) => (
                  <div key={attribute.key} className="grid grid-cols-[200px_repeat(auto-fit,minmax(250px,1fr))]">
                    <div className="bg-muted/30 px-4 py-4 font-medium flex items-center">
                      {attribute.label}
                    </div>
                    {items.map((product, index) => (
                      <div key={`${attribute.key}-${product.id}`} className="relative">
                        {index === 0 && attribute.key === "image" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute -top-2 -right-2 z-10"
                            onClick={() => removeItem(product.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        {renderCell(attribute, product, index)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}

            {/* Action buttons */}
            <div className="grid grid-cols-[200px_repeat(auto-fit,minmax(250px,1fr))] bg-muted/30">
              <div className="px-4 py-4 font-medium">Actions</div>
              {items.map((product) => (
                <div key={`action-${product.id}`} className="p-4">
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
        </div>
      </ScrollArea>
    </div>
  );
}