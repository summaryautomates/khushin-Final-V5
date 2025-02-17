import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getProduct } from "@/lib/products";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";

export default function Product() {
  const { id } = useParams();
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(parseInt(id || "0")),
  });
  const { addItem } = useCart();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="container py-12">
      <Card className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="aspect-square relative">
            <img
              src={product.image}
              alt={product.name}
              className="object-cover w-full h-full rounded-lg"
            />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-2xl">${product.price}</p>
            <p className="text-muted-foreground">{product.description}</p>
            <Button onClick={() => addItem(product)}>Add to Cart</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}