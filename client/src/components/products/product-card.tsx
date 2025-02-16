import { Link } from "wouter";
import { motion } from "framer-motion";
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden border-none shadow-none group bg-zinc-900/50 backdrop-blur-lg">
        <CardHeader className="p-0">
          <div className="aspect-square overflow-hidden bg-zinc-800">
            <motion.img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <CardTitle className="font-extralight text-xl tracking-wide text-white">
            {product.name}
          </CardTitle>
          <CardDescription className="mt-3 text-sm leading-relaxed text-zinc-400">
            {product.description}
          </CardDescription>
          <motion.div 
            className="mt-4 font-light text-lg text-white"
            whileHover={{ scale: 1.05 }}
          >
            {formatPrice(product.price)}
          </motion.div>
        </CardContent>
        <CardFooter className="p-6 pt-0 flex justify-center">
          <Link href={`/product/${product.id}`}>
            <Button 
              variant="outline" 
              className="w-full font-light tracking-wide text-white border-white/20 hover:bg-white/10 transition-all duration-300"
            >
              View Details
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}