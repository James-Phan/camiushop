import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import ProductList from "@/components/product/product-list";
import ProductFilter from "@/components/product/product-filter";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@/lib/types";

export default function ProductsPage() {
  // Get query params
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1]);
  
  const categoryIdParam = params.get("category");
  const searchParam = params.get("search");

  // State for filters
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([10, 200]);
  const [minRating, setMinRating] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // Get categories for the filter
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Initialize filters based on URL params
  useEffect(() => {
    if (categoryIdParam) {
      setSelectedCategories([parseInt(categoryIdParam)]);
    }
    
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [categoryIdParam, searchParam]);

  const handleCategoryChange = (id: number) => {
    setSelectedCategories(prev => 
      prev.includes(id) 
        ? prev.filter(c => c !== id) 
        : [...prev, id]
    );
  };

  const handlePriceChange = (range: [number, number]) => {
    setPriceRange(range);
  };

  const handleRatingChange = (rating: number) => {
    setMinRating(rating);
  };

  // Get categoryId for the ProductList if there's only one selected
  const categoryId = selectedCategories.length === 1 ? selectedCategories[0] : undefined;

  return (
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="font-poppins font-bold text-2xl mb-2">
            {categoryId && categories?.find(c => c.id === categoryId)?.name 
              ? `${categories.find(c => c.id === categoryId)?.name} Products`
              : searchTerm 
                ? `Search results for "${searchTerm}"`
                : "All Products"}
          </h1>
          {searchTerm && (
            <p className="text-muted-foreground">Browse our selection of products matching your search.</p>
          )}
          {categoryId && categories?.find(c => c.id === categoryId)?.description && (
            <p className="text-muted-foreground">
              {categories.find(c => c.id === categoryId)?.description}
            </p>
          )}
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Filters - Sidebar */}
          <div className="md:w-1/4 lg:w-1/5 mb-6 md:mb-0 md:pr-6">
            <ProductFilter 
              selectedCategories={selectedCategories}
              priceRange={priceRange}
              minRating={minRating}
              onCategoryChange={handleCategoryChange}
              onPriceChange={handlePriceChange}
              onRatingChange={handleRatingChange}
              onApplyFilters={() => {}}
            />
          </div>
          
          {/* Products Grid */}
          <div className="md:w-3/4 lg:w-4/5">
            <ProductList 
              categoryId={categoryId}
              searchTerm={searchTerm}
              priceRange={priceRange}
              minRating={minRating}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
