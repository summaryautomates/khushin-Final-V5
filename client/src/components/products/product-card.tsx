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
      <Card className="group relative overflow-hidden transition-shadow hover:shadow-lg bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.05] transition-all duration-500">
        <div className="absolute top-2 right-2 z-20 rounded-full bg-green-500/90 px-2 py-1 text-xs text-white">
          Verified Product
        </div>
        <CardHeader className="p-0">
          <div className="aspect-square overflow-hidden bg-zinc-900">
            <motion.img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover opacity-90"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <CardTitle className="font-extralight text-lg tracking-widest text-white">
            {product.name}
          </CardTitle>
          <CardDescription className="mt-3 text-sm leading-relaxed text-zinc-400 tracking-wide">
            {product.description}
          </CardDescription>
          <motion.div 
            className="mt-4 font-light text-lg text-white tracking-wider"
            whileHover={{ scale: 1.02 }}
          >
            {formatPrice(product.price)}
          </motion.div>
        </CardContent>
        <CardFooter className="p-6 pt-0 flex justify-center">
          <Link href={`/product/${product.id}`}>
            <Button 
              variant="outline" 
              className="w-full font-extralight tracking-widest text-white border-white/10 hover:bg-white/5 transition-all duration-300"
            >
              Details
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}