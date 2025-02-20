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
  SortAsc,
  SortDesc,
  Search,
  X,
  History,
  Save
} from "lucide-react";
import type { Product } from "@shared/schema";

interface SearchHistory {
  term: string;
  category: string;
  priceRange: [number, number];
  timestamp: Date;
}

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [category, setCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name-asc");
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [savedSearches, setSavedSearches] = useState<SearchHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const categories = products 
    ? ["all", ...Array.from(new Set(products.map(p => p.category)))]
    : ["all"];

  const saveSearch = () => {
    const newSearch: SearchHistory = {
      term: searchTerm,
      category,
      priceRange,
      timestamp: new Date()
    };
    setSavedSearches(prev => [...prev, newSearch]);
  };

  const applySearch = (search: SearchHistory) => {
    setSearchTerm(search.term);
    setCategory(search.category);
    setPriceRange(search.priceRange);
  };

  useEffect(() => {
    if (searchTerm || category !== "all" || priceRange[0] > 0 || priceRange[1] < 50000) {
      const newHistory: SearchHistory = {
        term: searchTerm,
        category,
        priceRange,
        timestamp: new Date()
      };
      setSearchHistory(prev => [newHistory, ...prev.slice(0, 9)]);
    }
  }, [searchTerm, category, priceRange]);

  const filteredProducts = products?.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = category === "all" || product.category === category;

    const matchesPrice = 
      product.price >= priceRange[0] && 
      product.price <= priceRange[1];

    return matchesSearch && matchesCategory && matchesPrice;
  }).sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "name-asc":
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const resetFilters = () => {
    setSearchTerm("");
    setPriceRange([0, 50000]);
    setCategory("all");
    setSortBy("name-asc");
  };

  if (isLoading) {
    return (
      <div className="container min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading products...</div>
      </div>
    );
  }

  const maxPrice = Math.max(...(products?.map(p => p.price) || [100000]));

  return (
    <div className="container py-12">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-extralight tracking-wider">Our Collection</h1>
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
              onClick={resetFilters}
              className="gap-2"
            >
              <X className="w-4 h-4" /> Reset Filters
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[300px,1fr]">
          {/* Filters Sidebar */}
          <div className="space-y-6">
            <div className="p-6 bg-white/[0.02] backdrop-blur-sm rounded-lg space-y-6">
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

              <div className="space-y-2">
                <h3 className="font-medium">Sort By</h3>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                    <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="w-full gap-2" 
                variant="outline"
                onClick={saveSearch}
              >
                <Save className="w-4 h-4" /> Save Search
              </Button>
            </div>

            {/* Search History Panel */}
            {showHistory && (
              <div className="p-6 bg-white/[0.02] backdrop-blur-sm rounded-lg space-y-4">
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
              </div>
            )}
          </div>

          {/* Product Grid */}
          <div>
            {filteredProducts && filteredProducts.length > 0 ? (
              <>
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                  </p>
                </div>
                <ProductGrid products={filteredProducts} isLoading={isLoading} />
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">
                  No products found matching your criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}