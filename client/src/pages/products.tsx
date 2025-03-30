import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductGrid } from "@/components/products/product-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchSidebar, SearchFilters } from "@/components/products/search-sidebar";
import {
  Crown,
  Search,
  X,
  History,
  Save,
  Flame,
  Diamond
} from "lucide-react";
import type { Product } from "@shared/schema";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

interface SearchHistory {
  term: string;
  category: string;
  priceRange: [number, number];
  timestamp: Date;
}

export default function Products() {
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [category, setCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name-asc");
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [savedSearches, setSavedSearches] = useState<SearchHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Parse category from URL if present
  useEffect(() => {
    const urlCategory = location.match(/\/products\/category\/(.+)/)?.[1];
    if (urlCategory) {
      setCategory(urlCategory);
    } else {
      setCategory("all");
    }
  }, [location]);

  const { data, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Ensure we have an array to work with
  const allProducts = Array.isArray(data) ? data : [];

  // Filter and sort products
  const filteredProducts = allProducts
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = category === "all" || product.category === category;
      
      // Skip price filter if not yet initialized
      let matchesPrice = true;
      if (isInitialized && priceRange[1] > 0) {
        matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      }
      
      // Skip luxury collection products in the general collection page
      // They will be shown only in the premium-collection page
      if (location === "/products" && product.collection === "luxury") {
        return false;
      }
      
      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "name-desc":
          return b.name.localeCompare(a.name);
        default: // name-asc
          return a.name.localeCompare(b.name);
      }
    });

  // Get unique categories from all products
  const categories = ["all", ...Array.from(new Set(allProducts.map(p => p.category)))
    .filter(cat => cat !== 'refueling')
    .sort()];

  const applySearch = (search: SearchHistory) => {
    setSearchTerm(search.term);
    setCategory(search.category);
    setPriceRange(search.priceRange);
    setShowHistory(false);
  };

  // Calculate max price for slider
  const maxPrice = allProducts.length > 0 
    ? Math.max(...allProducts.map(p => p.price)) 
    : 1000000;
    
  // Initialize price range when products are loaded
  useEffect(() => {
    if (allProducts.length > 0 && !isInitialized) {
      setPriceRange([0, maxPrice]);
      setIsInitialized(true);
    }
  }, [allProducts, maxPrice, isInitialized]);

  return (
    <div className="container py-12">
      <div className="space-y-8">
        {category === "lighters" && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-800 p-8 md:p-12"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30"
              style={{ backgroundImage: "url('/LL.png')" }}
            />
            <div className="relative z-10 max-w-3xl">
              <div className="flex items-center gap-2 mb-6">
                <Crown className="h-8 w-8 text-gold" />
                <h1 className="text-4xl font-light tracking-wider text-white">Luxury Lighters Collection</h1>
              </div>
              <p className="text-zinc-300 leading-relaxed mb-8">
                Discover our exquisite collection of premium lighters, each piece a testament to unparalleled craftsmanship
                and timeless elegance. From limited editions to bespoke designs, find your perfect companion of sophistication.
              </p>
              <div className="flex flex-wrap gap-4">
                <Badge variant="outline" className="bg-gold/10 text-gold border-gold/20 px-3 py-1.5">
                  <Diamond className="w-4 h-4 mr-2" />
                  Premium Materials
                </Badge>
                <Badge variant="outline" className="bg-gold/10 text-gold border-gold/20 px-3 py-1.5">
                  <Flame className="w-4 h-4 mr-2" />
                  Lifetime Warranty
                </Badge>
              </div>
            </div>
          </motion.div>
        )}
        
        {category === "flask" && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-800 p-8 md:p-12"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30"
              style={{ backgroundImage: "url('/products/Flask 1.jpg')" }}
            />
            <div className="relative z-10 max-w-3xl">
              <div className="flex items-center gap-2 mb-6">
                <Crown className="h-8 w-8 text-gold" />
                <h1 className="text-4xl font-light tracking-wider text-white">Premium Flask Collection</h1>
              </div>
              <p className="text-zinc-300 leading-relaxed mb-8">
                Explore our premium collection of elegant flasks, perfect for carrying your favorite beverages in style.
                Each flask is crafted with precision using high-quality materials for durability and sophistication.
              </p>
              <div className="flex flex-wrap gap-4">
                <Badge variant="outline" className="bg-gold/10 text-gold border-gold/20 px-3 py-1.5">
                  <Diamond className="w-4 h-4 mr-2" />
                  Stainless Steel
                </Badge>
                <Badge variant="outline" className="bg-gold/10 text-gold border-gold/20 px-3 py-1.5">
                  <Flame className="w-4 h-4 mr-2" />
                  Luxury Design
                </Badge>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-extralight tracking-wider">
            {category === "all" ? "Our Collection" : `${category.charAt(0).toUpperCase() + category.slice(1)}`}
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowHistory(!showHistory)}
              className="relative"
            >
              <History className="w-4 h-4" />
              {searchHistory.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setSearchTerm("");
                setPriceRange([0, maxPrice]);
                setCategory("all");
                setSortBy("name-asc");
              }}
              className="gap-2"
            >
              <X className="w-4 h-4" /> Reset Filters
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[300px,1fr]">
          {/* Filters Sidebar */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <SearchSidebar
                onFiltersChange={(filters) => {
                  setSearchTerm(filters.searchTerm);
                  setCategory(filters.category);
                  setPriceRange(filters.priceRange);
                  setSortBy(filters.sortBy);
                }}
                initialFilters={{
                  searchTerm,
                  category,
                  priceRange,
                  sortBy,
                }}
                onSaveSearch={() => {
                  const newSearch: SearchHistory = {
                    term: searchTerm,
                    category,
                    priceRange,
                    timestamp: new Date()
                  };
                  setSavedSearches(prev => [...prev, newSearch]);
                }}
              />
            </motion.div>

            {/* Search History Panel */}
            {showHistory && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-black rounded-lg space-y-4 border border-white/10"
              >
                <h3 className="text-white font-medium text-lg">Recent Searches</h3>
                <div className="space-y-2">
                  {searchHistory.map((search, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-zinc-800 rounded-lg cursor-pointer"
                      onClick={() => applySearch(search)}
                    >
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-white/70" />
                        <span className="text-sm text-white">{search.term || "All Products"}</span>
                      </div>
                      <div className="mt-1 flex gap-2">
                        {search.category !== "all" && (
                          <Badge variant="outline" className="text-xs text-white border-white/10">
                            {search.category}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs text-white border-white/10">
                          ₹{search.priceRange[0].toLocaleString()} - ₹{search.priceRange[1].toLocaleString()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                <h3 className="text-white font-medium text-lg pt-4">Saved Searches</h3>
                <div className="space-y-2">
                  {savedSearches.map((search, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-zinc-800 rounded-lg cursor-pointer"
                      onClick={() => applySearch(search)}
                    >
                      <div className="flex items-center gap-2">
                        <Save className="w-4 h-4 text-white/70" />
                        <span className="text-sm text-white">{search.term || "All Products"}</span>
                      </div>
                      <div className="mt-1 flex gap-2">
                        {search.category !== "all" && (
                          <Badge variant="outline" className="text-xs text-white border-white/10">
                            {search.category}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs text-white border-white/10">
                          ₹{search.priceRange[0].toLocaleString()} - ₹{search.priceRange[1].toLocaleString()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Product Grid */}
          <div>
            {isLoading ? (
              <ProductGrid products={[]} isLoading={true} />
            ) : filteredProducts.length > 0 ? (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-6"
                >
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                  </p>
                </motion.div>
                <ProductGrid products={filteredProducts} isLoading={false} />
              </>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-lg text-muted-foreground">
                  No products found matching your criteria.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}