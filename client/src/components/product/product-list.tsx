import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductWithDetails } from "@/lib/types";
import ProductCard from "./product-card";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductListProps {
  categoryId?: number;
  featured?: boolean;
  new?: boolean;
  bestseller?: boolean;
  searchTerm?: string;
  priceRange?: [number, number];
  minRating?: number;
}

export default function ProductList({
  categoryId,
  featured,
  new: isNew,
  bestseller,
  searchTerm,
  priceRange = [0, Infinity],
  minRating = 0
}: ProductListProps) {
  const [sortBy, setSortBy] = useState("popularity");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (categoryId) queryParams.append("category", categoryId.toString());
  if (featured) queryParams.append("featured", "true");
  if (isNew) queryParams.append("new", "true");
  if (bestseller) queryParams.append("bestseller", "true");

  // Fetch products
  const { data: products, isLoading } = useQuery<ProductWithDetails[]>({
    queryKey: [`/api/products?${queryParams.toString()}`],
  });

  // Apply client-side filtering for search and rating
  const filteredProducts = products?.filter(product => {
    // Filter by search term
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Filter by price range
    const price = product.salePrice || product.price;
    if (price < priceRange[0] || price > priceRange[1]) {
      return false;
    }

    // Filter by rating
    if (minRating > 0) {
      const avgRating = product.reviews?.length 
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0;
      
      if (avgRating < minRating) {
        return false;
      }
    }

    return true;
  }) || [];

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low-high":
        return (a.salePrice || a.price) - (b.salePrice || b.price);
      case "price-high-low":
        return (b.salePrice || b.price) - (a.salePrice || a.price);
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "rating":
        const aAvg = a.reviews?.length 
          ? a.reviews.reduce((sum, review) => sum + review.rating, 0) / a.reviews.length
          : 0;
        const bAvg = b.reviews?.length 
          ? b.reviews.reduce((sum, review) => sum + review.rating, 0) / b.reviews.length
          : 0;
        return bAvg - aAvg;
      default:
        // popularity - default
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h2 className="font-poppins font-semibold text-xl mb-2 sm:mb-0">
              {featured ? "Featured Products" : 
               isNew ? "New Arrivals" : 
               bestseller ? "Bestsellers" : 
               categoryId ? "Category Products" : "All Products"}
              {filteredProducts.length > 0 && <span className="text-sm font-normal text-muted-foreground ml-2">({filteredProducts.length} products)</span>}
            </h2>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-muted-foreground">Sort by:</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Popularity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Popularity</SelectItem>
                  <SelectItem value="price-low-high">Price: Low to High</SelectItem>
                  <SelectItem value="price-high-low">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <Skeleton className="h-64 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-5 w-full mb-1" />
                <Skeleton className="h-4 w-24 mb-2" />
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium">No products found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination className="mt-10">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                      // Show first page, last page, current page, and pages around current
                      let pageToShow = i + 1;
                      
                      if (totalPages > 5) {
                        if (currentPage <= 3) {
                          // Near the start
                          pageToShow = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          // Near the end
                          pageToShow = totalPages - 4 + i;
                        } else {
                          // In the middle
                          pageToShow = currentPage - 2 + i;
                        }
                      }

                      if (totalPages > 5 && i === 0 && pageToShow > 1) {
                        return (
                          <PaginationItem key={1}>
                            <PaginationLink onClick={() => setCurrentPage(1)}>1</PaginationLink>
                          </PaginationItem>
                        );
                      }

                      if (totalPages > 5 && i === 1 && pageToShow > 2) {
                        return (
                          <PaginationItem key="ellipsis-start">
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }

                      if (totalPages > 5 && i === 3 && pageToShow < totalPages - 1) {
                        return (
                          <PaginationItem key="ellipsis-end">
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }

                      if (totalPages > 5 && i === 4 && pageToShow < totalPages) {
                        return (
                          <PaginationItem key={totalPages}>
                            <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                              {totalPages}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }

                      return (
                        <PaginationItem key={pageToShow}>
                          <PaginationLink 
                            isActive={currentPage === pageToShow}
                            onClick={() => setCurrentPage(pageToShow)}
                          >
                            {pageToShow}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
