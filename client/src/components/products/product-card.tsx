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
    <Card className="overflow-hidden border-none shadow-none group">
      <CardHeader className="p-0">
        <div className="aspect-square overflow-hidden bg-zinc-50">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      </CardHeader>
      <CardContent className="p-6 text-center">
        <CardTitle className="font-light text-xl tracking-wide">
          {product.name}
        </CardTitle>
        <CardDescription className="mt-3 text-sm leading-relaxed text-zinc-600">
          {product.description}
        </CardDescription>
        <div className="mt-4 font-light text-lg">
          {formatPrice(product.price)}
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0 flex justify-center">
        <Link href={`/product/${product.id}`}>
          <Button variant="outline" className="w-full font-light tracking-wide">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}