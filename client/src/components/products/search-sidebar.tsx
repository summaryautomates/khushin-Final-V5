import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
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
  priceRange: [number, number];
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
  // Initialize state with initial filters or defaults
  const [searchTerm, setSearchTerm] = useState(initialFilters?.searchTerm || '');
  const [category, setCategory] = useState(initialFilters?.category || 'all');
  const [priceRange, setPriceRange] = useState<[number, number]>(
    initialFilters?.priceRange || [0, 1000000]
  );
  const [sortBy, setSortBy] = useState(initialFilters?.sortBy || 'name-asc');

  // Get products for category list and max price
  const { data } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Ensure we have an array to work with
  const allProducts = Array.isArray(data) ? data : [];

  // Get unique categories from all products
  const categories = ['all', ...Array.from(new Set(allProducts.map(p => p.category)))
    .filter(cat => cat !== 'refueling')
    .sort()];

  // Calculate max price for slider
  const maxPrice = allProducts.length > 0 
    ? Math.max(...allProducts.map(p => p.price)) 
    : 1000000;

  // Update parent component when filters change
  useEffect(() => {
    onFiltersChange({
      searchTerm,
      category,
      priceRange,
      sortBy,
    });
  }, [searchTerm, category, priceRange, sortBy, onFiltersChange]);

  // Handle search input submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({
      searchTerm,
      category,
      priceRange,
      sortBy,
    });
  };

  return (
    <div className="bg-black rounded-lg p-6 w-full space-y-6">
      {/* Search Input */}
      <div className="space-y-2">
        <h3 className="text-white font-medium text-lg">Search</h3>
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <Input
            type="search"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow bg-black border-white/10 text-white"
          />
          <Button type="submit" size="icon" variant="secondary" className="bg-zinc-800 hover:bg-zinc-700">
            <Search className="w-4 h-4" />
          </Button>
        </form>
      </div>

      {/* Category Selector */}
      <div className="space-y-2">
        <h3 className="text-white font-medium text-lg">Category</h3>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full bg-black border-white/10 text-white">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent className="bg-black text-white border-white/10">
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat} className="hover:bg-zinc-800">
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort By */}
      <div className="space-y-2">
        <h3 className="text-white font-medium text-lg">Sort By</h3>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full bg-black border-white/10 text-white">
            <SelectValue placeholder="Name (A-Z)" />
          </SelectTrigger>
          <SelectContent className="bg-black text-white border-white/10">
            <SelectItem value="name-asc" className="hover:bg-zinc-800">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc" className="hover:bg-zinc-800">Name (Z-A)</SelectItem>
            <SelectItem value="price-asc" className="hover:bg-zinc-800">Price (Low to High)</SelectItem>
            <SelectItem value="price-desc" className="hover:bg-zinc-800">Price (High to Low)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <h3 className="text-white font-medium text-lg">Price Range</h3>
        <Slider
          min={0}
          max={maxPrice}
          step={1000}
          value={[priceRange[0], priceRange[1]]}
          onValueChange={(value) => setPriceRange(value as [number, number])}
          className="mt-2 [&>.absolute]:bg-amber-500"
        />
        <div className="flex items-center justify-between text-sm text-white/70">
          <span>₹{priceRange[0].toLocaleString()}</span>
          <span>₹{priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      {/* Save Search Button */}
      {onSaveSearch && (
        <Button
          className="w-full gap-2 bg-zinc-800 hover:bg-zinc-700 text-white border-white/10"
          variant="outline"
          onClick={onSaveSearch}
        >
          <Save className="w-4 h-4" /> Save Search
        </Button>
      )}
    </div>
  );
}