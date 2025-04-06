import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Save } from 'lucide-react';
import type { Product } from '@shared/schema';

export interface SearchFilters {
  searchTerm: string;
  category: string;
  sortBy: string;
}

interface SearchSidebarProps {
  onFiltersChange: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
  onSaveSearch?: () => void;
}

export function SearchSidebar({
  onFiltersChange,
  initialFilters,
  onSaveSearch,
}: SearchSidebarProps) {
  // Get products for category list
  const { data } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Ensure we have an array to work with
  const allProducts = Array.isArray(data) ? data : [];

  // Initialize state with initial filters or defaults
  const [searchTerm, setSearchTerm] = useState(initialFilters?.searchTerm || '');
  const [category, setCategory] = useState(initialFilters?.category || 'all');
  const [sortBy, setSortBy] = useState(initialFilters?.sortBy || 'name-asc');

  // Get unique categories from all products
  const categories = ['all', ...Array.from(new Set(allProducts.map(p => p.category)))
    .filter(cat => cat !== 'refueling')
    .sort()];

  // Update parent component when filters change
  useEffect(() => {
    onFiltersChange({
      searchTerm,
      category,
      sortBy,
    });
  }, [searchTerm, category, sortBy, onFiltersChange]);

  // Handle search input submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({
      searchTerm,
      category,
      sortBy,
    });
  };

  return (
    <div className="bg-gradient-to-b from-zinc-900 to-black rounded-xl p-7 w-full space-y-7 border border-zinc-800/30 shadow-lg">
      {/* Search Input */}
      <div className="space-y-3">
        <h3 className="text-white/90 font-medium text-lg flex items-center gap-2">
          <Search className="w-4 h-4 text-primary/80" />
          Search Products
        </h3>
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <Input
            type="search"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow bg-black/40 border-white/10 text-white focus:border-primary/50 focus:ring-primary/20 rounded-lg h-11"
          />
          <Button 
            type="submit" 
            size="icon" 
            variant="secondary" 
            className="bg-primary/80 hover:bg-primary text-black h-11 w-11 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            <Search className="w-5 h-5" />
          </Button>
        </form>
      </div>

      {/* Category Selector */}
      <div className="space-y-3">
        <h3 className="text-white/90 font-medium text-lg flex items-center gap-2">
          <Search className="w-4 h-4 text-primary/80" />
          Category
        </h3>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full bg-black/40 border-white/10 text-white focus:border-primary/50 focus:ring-primary/20 rounded-lg h-11">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 text-white border-zinc-800 rounded-lg shadow-xl">
            {categories.map((cat) => (
              <SelectItem 
                key={cat} 
                value={cat} 
                className="hover:bg-zinc-800 focus:bg-zinc-800 data-[highlighted]:bg-zinc-800"
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort By */}
      <div className="space-y-3">
        <h3 className="text-white/90 font-medium text-lg flex items-center gap-2">
          <Search className="w-4 h-4 text-primary/80" />
          Sort By
        </h3>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full bg-black/40 border-white/10 text-white focus:border-primary/50 focus:ring-primary/20 rounded-lg h-11">
            <SelectValue placeholder="Name (A-Z)" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 text-white border-zinc-800 rounded-lg shadow-xl">
            <SelectItem value="name-asc" className="hover:bg-zinc-800 focus:bg-zinc-800 data-[highlighted]:bg-zinc-800">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc" className="hover:bg-zinc-800 focus:bg-zinc-800 data-[highlighted]:bg-zinc-800">Name (Z-A)</SelectItem>
            <SelectItem value="price-asc" className="hover:bg-zinc-800 focus:bg-zinc-800 data-[highlighted]:bg-zinc-800">Price (Low to High)</SelectItem>
            <SelectItem value="price-desc" className="hover:bg-zinc-800 focus:bg-zinc-800 data-[highlighted]:bg-zinc-800">Price (High to Low)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Save Search Button */}
      {onSaveSearch && (
        <Button
          className="w-full gap-2 bg-black/40 hover:bg-zinc-800 text-white border-white/20 h-11 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          variant="outline"
          onClick={onSaveSearch}
        >
          <Save className="w-4 h-4 text-primary/80 mr-1" /> Save Search
        </Button>
      )}
    </div>
  );
}