import { useQuery } from "@tanstack/react-query";
import { Category } from "@/lib/types";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategorySection() {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  return (
    <section className="mb-16">
      <div className="container mx-auto px-4">
        <h2 className="font-poppins font-semibold text-2xl mb-6 text-center">Shop By Category</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="aspect-square rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories?.map(category => (
              <Link href={`/products?category=${category.id}`} key={category.id} className="group relative rounded-lg overflow-hidden bg-gray-100 aspect-square">
                {category.image && (
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105" 
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                  <span className="text-white font-poppins font-medium p-4 block w-full text-center">{category.name}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
