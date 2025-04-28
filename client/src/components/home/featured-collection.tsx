import { useQuery } from "@tanstack/react-query";
import { ProductWithDetails } from "@/lib/types";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeaturedCollection() {
  // Fetch featured products
  const { data: featuredProducts, isLoading } = useQuery<ProductWithDetails[]>({
    queryKey: ['/api/products?featured=true'],
  });

  // Create three collections of featured products
  const collections = [
    {
      title: "Summer Skincare Set",
      description: "Protect and nourish your skin with our complete summer care kit.",
      image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&h=500",
      link: "/products?category=1"
    },
    {
      title: "Sun Protection",
      description: "Our range of SPF products to keep your skin safe from harmful UV rays.",
      image: "https://images.unsplash.com/photo-1586195831803-4d2e5b4ddb97?auto=format&fit=crop&w=600&h=500",
      link: "/products?category=1"
    },
    {
      title: "Summer Fragrances",
      description: "Light and refreshing scents perfect for warm summer days.",
      image: "https://images.unsplash.com/photo-1562887106-0ba63ac82e02?auto=format&fit=crop&w=600&h=500",
      link: "/products?category=4"
    }
  ];

  return (
    <section className="mb-16 bg-light py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-poppins font-semibold text-2xl mb-2">Summer Essentials Collection</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Discover our specially curated collection of skincare and beauty products perfect for the summer season.
          </p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-72 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {collections.map((collection, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden group">
                <div className="relative h-72">
                  <img 
                    src={collection.image} 
                    alt={collection.title} 
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                    <h3 className="text-white font-poppins font-medium text-xl mb-2">{collection.title}</h3>
                    <p className="text-white/80 mb-4 text-sm">{collection.description}</p>
                    <Button asChild variant="default" className="self-start rounded-full">
                      <Link href={collection.link}>Shop Now</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
