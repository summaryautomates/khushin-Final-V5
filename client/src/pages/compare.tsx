import { useCompare } from "@/hooks/use-compare";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/products";
import { X, ShoppingCart, AlertCircle, Check, Minus, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { Product } from "@shared/schema";
import { ImageComparison } from "@/components/products/image-comparison";

// Extended product type to include additional comparison fields
interface ExtendedProduct extends Product {
  material?: string;
  dimensions?: string;
  warranty?: string;
  stock?: number;
  shipping?: string;
  [key: string]: any; // Allow dynamic property access
}

// Helper type for comparison attributes
interface ComparisonAttribute {
  label: string;
  key: string;
  type: 'image' | 'text' | 'price' | 'badge' | 'features' | 'stock';
}

interface ComparisonGroup {
  title: string;
  attributes: ComparisonAttribute[];
}

export default function ComparePage() {
  const { items, removeItem, clearItems } = useCompare();
  const { addItem } = useCart();
  const { toast } = useToast();

  if (items.length === 0) {
    return (
      <div className="container py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-2xl font-bold mb-4">Product Comparison</h1>
          <p className="text-muted-foreground">No products selected for comparison.</p>
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const handleAddToCart = async (product: ExtendedProduct) => {
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
  const compareGroups: ComparisonGroup[] = [
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
        { label: "Material", key: "material", type: "text" },
        { label: "Dimensions", key: "dimensions", type: "text" },
      ]
    },
    {
      title: "Additional Information",
      attributes: [
        { label: "Warranty", key: "warranty", type: "text" },
        { label: "Stock", key: "stock", type: "stock" },
        { label: "Shipping", key: "shipping", type: "text" },
      ]
    }
  ];

  // Function to determine if a value is different from others
  const isDifferent = (key: string, value: any, index: number) => {
    return items.some((item, i) => i !== index && (item as ExtendedProduct)[key] !== value);
  };

  // Function to render comparison cell based on type
  const renderCell = (attribute: ComparisonAttribute, product: ExtendedProduct, index: number) => {
    const value = product[attribute.key];
    const different = isDifferent(attribute.key, value, index);

    const cellClasses = cn(
      "py-4 px-4 transition-colors duration-200",
      different && "bg-primary/5"
    );

    switch (attribute.type) {
      case "image":
        if (index === 0) {
          return (
            <motion.div 
              className={cellClasses}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <ImageComparison 
                images={items.map(item => 
                  Array.isArray(item.images) && item.images.length > 0 
                    ? item.images[0] 
                    : '/placeholder-product.svg'
                )}
                titles={items.map(item => item.name)}
              />
            </motion.div>
          );
        }
        return null;
      case "price":
        return (
          <motion.div 
            className={cellClasses}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <span className="font-semibold text-primary">
              {formatPrice(value)}
            </span>
          </motion.div>
        );
      case "badge":
        return (
          <motion.div 
            className={cellClasses}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Badge variant="secondary">{value}</Badge>
          </motion.div>
        );
      case "stock":
        const inStock = value > 0;
        return (
          <motion.div 
            className={cellClasses}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Badge variant={inStock ? "success" : "destructive"}>
              {inStock ? "In Stock" : "Out of Stock"}
            </Badge>
          </motion.div>
        );
      case "features":
        const features = typeof value === 'object' ? (Object.values(value) as string[]) : [];
        return (
          <motion.div 
            className={cellClasses}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <ul className="list-none space-y-2">
              {features.map((feature: string, i: number) => (
                <motion.li 
                  key={i} 
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (index * 0.1) + (i * 0.05) }}
                >
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{feature}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        );
      default:
        return (
          <motion.div 
            className={cellClasses}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            {value || <Minus className="h-4 w-4 text-muted-foreground" />}
          </motion.div>
        );
    }
  };

  return (
    <div className="container py-12">
      <motion.div 
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
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
      </motion.div>

      {items.length >= 4 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-2 p-4 text-amber-600 bg-amber-500/10 rounded-lg"
        >
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm">Maximum of 4 products can be compared at once.</p>
        </motion.div>
      )}

      <ScrollArea className="w-full">
        <div className="min-w-full inline-block">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border rounded-lg overflow-hidden shadow-sm"
          >
            {compareGroups.map((group, groupIndex) => (
              <motion.div 
                key={group.title} 
                className="divide-y"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.1 }}
              >
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
                        {renderCell(attribute, product as ExtendedProduct, index)}
                      </div>
                    ))}
                  </div>
                ))}
              </motion.div>
            ))}

            {/* Action buttons */}
            <motion.div 
              className="grid grid-cols-[200px_repeat(auto-fit,minmax(250px,1fr))] bg-muted/30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="px-4 py-4 font-medium">Actions</div>
              {items.map((product, index) => (
                <motion.div 
                  key={`action-${product.id}`} 
                  className="p-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + (index * 0.1) }}
                >
                  <Button
                    onClick={() => handleAddToCart(product as ExtendedProduct)}
                    className="w-full gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </ScrollArea>
    </div>
  );
}