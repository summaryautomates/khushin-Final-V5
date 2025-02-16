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
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden border-none shadow-none group bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.05] transition-all duration-700">
        <CardHeader className="p-0">
          <motion.div 
            className="aspect-square overflow-hidden bg-zinc-900"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <motion.img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover opacity-90 transition-opacity duration-700 group-hover:opacity-100"
              initial={{ scale: 1.1 }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          </motion.div>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <CardTitle className="font-extralight text-lg tracking-widest text-white">
              {product.name}
            </CardTitle>
            <CardDescription className="mt-3 text-sm leading-relaxed text-zinc-400 tracking-wide">
              {product.description}
            </CardDescription>
            <motion.div 
              className="mt-4 font-light text-lg text-white tracking-wider"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              {formatPrice(product.price)}
            </motion.div>
          </motion.div>
        </CardContent>
        <CardFooter className="p-6 pt-0 flex justify-center">
          <Link href={`/product/${product.id}`}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <Button 
                variant="outline" 
                className="w-full font-extralight tracking-widest text-white border-white/10 hover:bg-white/5 transition-all duration-500"
              >
                Explore Details
              </Button>
            </motion.div>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}