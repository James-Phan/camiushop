import { useQuery } from "@tanstack/react-query";
import { Review, User, ProductWithDetails } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import StarRating from "@/components/ui/star-rating";
import { Card, CardContent } from "@/components/ui/card";

interface TestimonialCardProps {
  review: {
    id: number;
    title: string;
    comment: string;
    rating: number;
    user?: {
      username: string;
    };
  };
}

const TestimonialCard = ({ review }: TestimonialCardProps) => {
  // Random image for avatars
  const getRandomUserImage = (id: number) => {
    const gender = id % 2 === 0 ? 'women' : 'men';
    const number = (id % 70) + 1;
    return `https://randomuser.me/api/portraits/${gender}/${number}.jpg`;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex text-amber-400 mb-3">
          <StarRating rating={review.rating} />
        </div>
        <h3 className="font-poppins font-medium text-lg mb-2">{review.title}</h3>
        <p className="text-muted-foreground mb-4">{review.comment}</p>
        <div className="flex items-center">
          <img 
            src={getRandomUserImage(review.id)} 
            alt="Customer" 
            className="w-10 h-10 rounded-full mr-3" 
          />
          <div>
            <div className="font-poppins font-medium text-sm">{review.user?.username || "Happy Customer"}</div>
            <div className="text-muted-foreground text-xs">Verified Buyer</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function ReviewsSection() {
  // Get featured products and their reviews
  const { data: products, isLoading } = useQuery<ProductWithDetails[]>({
    queryKey: ['/api/products?featured=true'],
  });

  // Extract all reviews
  const allReviews = products?.flatMap(product => 
    product.reviews?.map(review => ({
      ...review,
      productName: product.name
    })) || []
  ) || [];

  // Get top rated reviews
  const topReviews = allReviews
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  // Fallback reviews in case no reviews are available
  const fallbackReviews = [
    {
      id: 1,
      title: "Transformed my skin!",
      comment: "I've been using the Vitamin C serum for a month now and my skin has never looked better. The dark spots have faded and my complexion is so much brighter.",
      rating: 5,
      user: { username: "Sarah J." }
    },
    {
      id: 2,
      title: "Worth every penny",
      comment: "The Hyaluronic Acid Sheet Masks are a game changer. My skin feels so plump and hydrated after using them. I use them twice a week and can really see the difference.",
      rating: 4.5,
      user: { username: "David C." }
    },
    {
      id: 3,
      title: "Finally found my foundation!",
      comment: "After trying countless brands, I've finally found a foundation that matches my skin tone perfectly and stays on all day without oxidizing. The finish is gorgeous too!",
      rating: 5,
      user: { username: "Maya P." }
    }
  ];

  // Use either actual reviews or fallback
  const displayReviews = topReviews.length > 0 ? topReviews : fallbackReviews;

  return (
    <section className="mb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-poppins font-semibold text-2xl mb-2">What Our Customers Say</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Real experiences from beauty enthusiasts who love our products.
          </p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-64 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayReviews.map(review => (
              <TestimonialCard key={review.id} review={review} />
            ))}
          </div>
        )}
        
        <div className="text-center mt-8">
          <a href="/products" className="font-poppins font-medium text-primary hover:text-primary/80 transition inline-flex items-center">
            View all reviews <i className="ri-arrow-right-line ml-1"></i>
          </a>
        </div>
      </div>
    </section>
  );
}
