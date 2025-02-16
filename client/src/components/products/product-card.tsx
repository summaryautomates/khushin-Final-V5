import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/products";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardHeader className="p-0">
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5 p-6">
        <CardTitle className="line-clamp-1 text-lg font-semibold tracking-tight">
          {product.name}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {product.description}
        </CardDescription>
        <div className="text-lg font-medium">
          {formatPrice(product.price)}
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Link href={`/product/${product.id}`}>
          <Button
            className="w-full transition-colors hover:bg-primary/90"
            variant="default"
          >
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}