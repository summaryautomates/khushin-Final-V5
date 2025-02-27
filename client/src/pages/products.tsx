import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductGrid } from "@/components/products/product-grid";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Filter,
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
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [category, setCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name-asc");
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [savedSearches, setSavedSearches] = useState<SearchHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);

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
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
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
              style={{ backgroundImage: "url('https://i.imghippo.com/files/GI4149xtI.png')" }}
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
              className="p-6 bg-white/[0.02] backdrop-blur-sm rounded-lg space-y-6 border border-white/10"
            >
              <div className="space-y-2">
                <h3 className="font-medium">Search</h3>
                <div className="flex gap-2">
                  <Input
                    type="search"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow"
                  />
                  <Button variant="secondary" size="icon">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Category</h3>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Sort By</h3>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                    <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Price Range</h3>
                <Slider
                  min={0}
                  max={maxPrice}
                  step={100}
                  value={[priceRange[0], priceRange[1]]}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  className="mt-2"
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>₹{priceRange[0].toLocaleString()}</span>
                  <span>₹{priceRange[1].toLocaleString()}</span>
                </div>
              </div>

              <Button
                className="w-full gap-2"
                variant="outline"
                onClick={() => {
                  const newSearch: SearchHistory = {
                    term: searchTerm,
                    category,
                    priceRange,
                    timestamp: new Date()
                  };
                  setSavedSearches(prev => [...prev, newSearch]);
                }}
              >
                <Save className="w-4 h-4" /> Save Search
              </Button>
            </motion.div>

            {/* Search History Panel */}
            {showHistory && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-white/[0.02] backdrop-blur-sm rounded-lg space-y-4 border border-white/10"
              >
                <h3 className="font-medium">Recent Searches</h3>
                <div className="space-y-2">
                  {searchHistory.map((search, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-white/[0.02] rounded-lg cursor-pointer"
                      onClick={() => applySearch(search)}
                    >
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{search.term || "All Products"}</span>
                      </div>
                      <div className="mt-1 flex gap-2">
                        {search.category !== "all" && (
                          <Badge variant="outline" className="text-xs">
                            {search.category}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          ₹{search.priceRange[0].toLocaleString()} - ₹{search.priceRange[1].toLocaleString()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                <h3 className="font-medium pt-4">Saved Searches</h3>
                <div className="space-y-2">
                  {savedSearches.map((search, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-white/[0.02] rounded-lg cursor-pointer"
                      onClick={() => applySearch(search)}
                    >
                      <div className="flex items-center gap-2">
                        <Save className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{search.term || "All Products"}</span>
                      </div>
                      <div className="mt-1 flex gap-2">
                        {search.category !== "all" && (
                          <Badge variant="outline" className="text-xs">
                            {search.category}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
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