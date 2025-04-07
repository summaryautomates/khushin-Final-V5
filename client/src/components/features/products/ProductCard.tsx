import React from 'react';
import { Link } from 'wouter';
import { ShoppingCart, Eye, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CommonButton } from '../../ui/CommonButton';

// Import types from the schema
import type { Product } from '../../../../shared/schema';

interface ProductCardProps {
  product: Product;
  className?: string;
  highlight?: boolean;
  showQuickView?: boolean;
}

export function ProductCard({
  product,
  className,
  highlight = false,
  showQuickView = true,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  
  return (
    <div
      className={cn(
        'group relative rounded-lg overflow-hidden transition-all duration-300',
        highlight ? 'shadow-lg ring-1 ring-primary/10' : 'shadow',
        isHovered ? 'shadow-xl scale-[1.01]' : '',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image with overlay buttons on hover */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Link href={`/products/${product.id}`}>
          <a className="block h-full w-full">
            <img
              src={product.images[0] || '/placeholders/product.jpg'}
              alt={product.name}
              className="h-full w-full object-cover object-center transition-all duration-500 group-hover:scale-105"
            />
          </a>
        </Link>
        
        {/* Action buttons overlay - only show on hover */}
        <div className={cn(
          "absolute bottom-4 left-0 w-full px-4 flex justify-center space-x-2 transition-all duration-300",
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          {showQuickView && (
            <button 
              className="bg-black/70 text-white p-2 rounded hover:bg-black transition-colors"
              aria-label="Quick view"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
          <button 
            className="bg-black/70 text-white p-2 rounded hover:bg-black transition-colors"
            aria-label="Add to wishlist"
          >
            <Heart className="h-4 w-4" />
          </button>
          <button 
            className="bg-black/70 text-white p-2 rounded hover:bg-black transition-colors"
            aria-label="Add to cart"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
        
        {/* Category or collection tag */}
        {product.collection && (
          <div className="absolute top-4 left-4">
            <span className="bg-black text-white text-xs px-2 py-1 uppercase">
              {product.collection}
            </span>
          </div>
        )}
      </div>
      
      {/* Product info */}
      <div className="p-4">
        <h3 className="text-lg font-medium mb-1 transition-colors group-hover:text-primary">
          <Link href={`/products/${product.id}`}>
            <a>{product.name}</a>
          </Link>
        </h3>
        
        <p className="text-sm text-gray-500 mb-2 line-clamp-2">{product.description}</p>
        
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-baseline">
            <span className="text-xl font-semibold">₹{product.price.toLocaleString()}</span>
            {/* Optional sale price logic could go here */}
          </div>
          
          <CommonButton 
            variant="luxury" 
            size="sm"
            iconRight={<ShoppingCart className="h-4 w-4" />}
          >
            Add
          </CommonButton>
        </div>
      </div>
    </div>
  );
}