import { Link } from "wouter";
import { ProductWithDetails } from "@/lib/types";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import StarRating from "@/components/ui/star-rating";
import { Heart, Eye, ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: ProductWithDetails;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  
  // Calculate average rating
  const avgRating = product.reviews?.length 
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
    : 0;
  
  return (
    <Card className="overflow-hidden group product-card">
      <div className="relative">
        <Link href={`/products/${product.id}`}>
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-64 object-cover"
          />
        </Link>
        
        <div className="product-actions absolute top-0 right-0 p-2 opacity-0 transition-opacity duration-300">
          <Button 
            variant="default" 
            size="icon" 
            className="bg-white text-foreground rounded-full p-2 shadow-md hover:bg-primary hover:text-white transition mb-2">
            <Heart className="h-4 w-4" />
            <span className="sr-only">Add to wishlist</span>
          </Button>
          <Button 
            variant="default" 
            size="icon" 
            className="bg-white text-foreground rounded-full p-2 shadow-md hover:bg-primary hover:text-white transition">
            <Eye className="h-4 w-4" />
            <span className="sr-only">Quick view</span>
          </Button>
        </div>
        
        {/* Product badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.new && (
            <span className="bg-accent text-accent-foreground text-xs font-poppins font-medium px-2 py-1 rounded">
              New
            </span>
          )}
          {product.salePrice && (
            <span className="bg-primary text-primary-foreground text-xs font-poppins font-medium px-2 py-1 rounded">
              -{Math.round((1 - product.salePrice / product.price) * 100)}%
            </span>
          )}
          {product.bestseller && (
            <span className="bg-secondary text-secondary-foreground text-xs font-poppins font-medium px-2 py-1 rounded">
              Bestseller
            </span>
          )}
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground mb-1">
          {product.category?.name || 'Product'}
        </div>
        
        <h3 className="font-poppins font-medium text-base mb-1">
          <Link href={`/products/${product.id}`} className="hover:text-primary transition">
            {product.name}
          </Link>
        </h3>
        
        <div className="flex items-center mb-2">
          <StarRating rating={avgRating} />
          <span className="text-xs text-muted-foreground ml-1">
            ({product.reviews?.length || 0})
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="font-poppins">
            {product.salePrice ? (
              <>
                <span className="font-medium">${product.salePrice.toFixed(2)}</span>
                <span className="text-muted-foreground text-sm line-through ml-2">
                  ${product.price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="font-medium">${product.price.toFixed(2)}</span>
            )}
          </div>
          
          <Button 
            variant="default" 
            size="icon"
            onClick={() => addToCart(product.id, 1)}
            className="bg-primary hover:bg-primary/90 text-white rounded-full p-2 transition">
            <ShoppingCart className="h-4 w-4" />
            <span className="sr-only">Add to cart</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
