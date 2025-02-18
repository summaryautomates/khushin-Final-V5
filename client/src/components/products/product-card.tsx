import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/products";
import type { Product } from "@shared/schema";
import { Eye, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addItem(product);
    toast({
      description: `${product.name} added to cart`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden border-none shadow-none group bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.05] transition-all duration-700">
        <CardHeader className="p-0">
          <motion.div 
            className="relative aspect-square overflow-hidden bg-zinc-900"
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
            <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Link href={`/product/${product.id}`}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="icon"
                    variant="secondary"
                    className="rounded-full bg-orange-400/90 hover:bg-orange-500 text-white"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </motion.div>
              </Link>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="icon"
                  variant="secondary"
                  className="rounded-full bg-white text-black hover:bg-gray-100"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="font-extralight text-lg tracking-widest text-white">
              {product.name}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400 tracking-wide line-clamp-2">
              {product.description}
            </p>
            <motion.div 
              className="mt-4 font-light text-lg text-white tracking-wider"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              {formatPrice(product.price)}
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}