import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ProductWithDetails, Review } from "@/lib/types";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import StarRating from "@/components/ui/star-rating";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ProductList from "@/components/product/product-list";
import { Minus, Plus, Heart } from "lucide-react";

export default function ProductDetailPage() {
  const { id } = useParams();
  const productId = parseInt(id);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("50ml");
  const [mainImage, setMainImage] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  
  // Fetch product details
  const { data: product, isLoading } = useQuery<ProductWithDetails>({
    queryKey: [`/api/products/${productId}`],
    onSuccess: (data) => {
      if (data.images && data.images.length > 0) {
        setMainImage(data.images[0]);
      } else {
        setMainImage(data.image);
      }
    }
  });
  
  // Fetch product reviews
  const { data: reviews } = useQuery<Review[]>({
    queryKey: [`/api/products/${productId}/reviews`],
    enabled: !!productId
  });
  
  // Review form schema
  const reviewFormSchema = z.object({
    rating: z.number().min(1, "Please select a rating"),
    title: z.string().min(3, "Title must be at least 3 characters"),
    comment: z.string().min(10, "Review must be at least 10 characters"),
  });
  
  const reviewForm = useForm<z.infer<typeof reviewFormSchema>>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 5,
      title: "",
      comment: "",
    },
  });
  
  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData: z.infer<typeof reviewFormSchema>) => {
      const res = await apiRequest("POST", "/api/reviews", {
        ...reviewData,
        productId
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Review submitted",
        description: "Thank you for your review!",
      });
      reviewForm.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/reviews`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit review",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmitReview = (data: z.infer<typeof reviewFormSchema>) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to submit a review.",
        variant: "destructive",
      });
      return;
    }
    
    submitReviewMutation.mutate(data);
  };
  
  // Calculate average rating
  const avgRating = reviews?.length 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;
  
  // Calculate discount percentage
  const discountPercentage = product?.salePrice && product?.price
    ? Math.round((1 - product.salePrice / product.price) * 100)
    : 0;
  
  // Handle quantity changes
  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => Math.max(1, prev - 1));
  
  // Handle add to cart
  const handleAddToCart = () => {
    if (!productId) return;
    
    addToCart(productId, quantity, selectedSize);
  };
  
  if (isLoading) {
    return (
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row -mx-4">
            <div className="lg:w-2/5 px-4 mb-8 lg:mb-0">
              <Skeleton className="w-full h-[400px] rounded-lg mb-4" />
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            </div>
            <div className="lg:w-3/5 px-4">
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-6 w-1/2 mb-4" />
              <Skeleton className="h-6 w-1/4 mb-6" />
              <Skeleton className="h-24 w-full mb-6" />
              <div className="space-y-4">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }
  
  if (!product) {
    return (
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6 text-center">
              <h1 className="font-poppins font-bold text-2xl mb-4">Product Not Found</h1>
              <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist or has been removed.</p>
              <Button asChild>
                <Link href="/products">Browse Other Products</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row -mx-4">
          {/* Product Images */}
          <div className="lg:w-2/5 px-4 mb-8 lg:mb-0">
            <div className="mb-4">
              <img 
                src={mainImage || product.image} 
                alt={product.name} 
                className="w-full h-auto rounded-lg shadow-sm" 
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.images?.map((image, index) => (
                <button 
                  key={index}
                  className={`border-2 ${mainImage === image ? 'border-primary' : 'border-gray-200'} rounded-md overflow-hidden hover:border-primary`}
                  onClick={() => setMainImage(image)}
                >
                  <img 
                    src={image} 
                    alt={`${product.name} thumbnail ${index + 1}`} 
                    className="w-full h-auto" 
                  />
                </button>
              ))}
              {/* If no gallery images, use main image */}
              {(!product.images || product.images.length === 0) && (
                <button 
                  className="border-2 border-primary rounded-md overflow-hidden"
                >
                  <img 
                    src={product.image} 
                    alt={`${product.name} thumbnail`} 
                    className="w-full h-auto" 
                  />
                </button>
              )}
            </div>
          </div>
          
          {/* Product Info */}
          <div className="lg:w-3/5 px-4">
            <Card>
              <CardContent className="p-6">
                <nav className="flex mb-4" aria-label="Breadcrumb">
                  <ol className="inline-flex items-center space-x-1 md:space-x-3 text-sm">
                    <li className="inline-flex items-center">
                      <Link href="/" className="text-muted-foreground hover:text-primary">Home</Link>
                    </li>
                    <li>
                      <div className="flex items-center">
                        <i className="ri-arrow-right-s-line text-muted-foreground"></i>
                        <Link href="/products" className="ml-1 text-muted-foreground hover:text-primary md:ml-2">Products</Link>
                      </div>
                    </li>
                    <li aria-current="page">
                      <div className="flex items-center">
                        <i className="ri-arrow-right-s-line text-muted-foreground"></i>
                        <span className="ml-1 text-primary md:ml-2">{product.name}</span>
                      </div>
                    </li>
                  </ol>
                </nav>
                
                <div className="mb-4">
                  <span className="text-xs text-muted-foreground">{product.category?.name || 'Product'}</span>
                  <h1 className="font-poppins font-semibold text-2xl mb-2">{product.name}</h1>
                  <div className="flex items-center mb-2">
                    <div className="flex text-amber-400 mr-2">
                      <StarRating rating={avgRating} />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {avgRating.toFixed(1)} ({reviews?.length || 0} {reviews?.length === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                  <div className="mb-4">
                    {product.salePrice ? (
                      <>
                        <span className="font-poppins font-semibold text-xl">${product.salePrice.toFixed(2)}</span>
                        <span className="text-muted-foreground text-sm line-through ml-2">${product.price.toFixed(2)}</span>
                        {discountPercentage > 0 && (
                          <span className="text-primary text-sm ml-2">{discountPercentage}% off</span>
                        )}
                      </>
                    ) : (
                      <span className="font-poppins font-semibold text-xl">${product.price.toFixed(2)}</span>
                    )}
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-muted-foreground mb-4">{product.description}</p>
                  
                  <div className="mb-4">
                    <h3 className="font-poppins font-medium text-sm mb-2">Key Benefits:</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
                      <li>Long-lasting protection</li>
                      <li>Improves skin texture</li>
                      <li>Gentle formula</li>
                      <li>Suitable for all skin types</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center mb-4">
                    <h3 className="font-poppins font-medium text-sm w-24">Size:</h3>
                    <div className="flex space-x-2">
                      <Button 
                        variant={selectedSize === "30ml" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setSelectedSize("30ml")}
                      >
                        30ml
                      </Button>
                      <Button 
                        variant={selectedSize === "50ml" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setSelectedSize("50ml")}
                      >
                        50ml
                      </Button>
                      <Button 
                        variant={selectedSize === "100ml" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setSelectedSize("100ml")}
                      >
                        100ml
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <h3 className="font-poppins font-medium text-sm w-24">Quantity:</h3>
                    <div className="flex">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-9 w-9 rounded-r-none"
                        onClick={decreaseQuantity}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className="h-9 w-14 rounded-none text-center"
                      />
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-9 w-9 rounded-l-none"
                        onClick={increaseQuantity}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <span className="text-sm text-muted-foreground ml-4">
                      {product.stock} items available
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-wrap space-y-3 sm:space-y-0 sm:space-x-3">
                  <Button 
                    className="w-full sm:w-auto"
                    onClick={handleAddToCart}
                  >
                    <i className="ri-shopping-cart-line mr-2"></i> Add to Cart
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto"
                  >
                    <Heart className="mr-2 h-4 w-4" /> Add to Wishlist
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Product Tabs */}
            <Card className="mt-8">
              <CardContent className="p-6">
                <Tabs defaultValue="description" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full justify-start border-b pb-px mb-4">
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                    <TabsTrigger value="how-to-use">How to Use</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews ({reviews?.length || 0})</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="description" className="py-4">
                    <p className="text-muted-foreground mb-4">{product.description}</p>
                    
                    <p className="text-muted-foreground mb-4">
                      Our {product.name} is designed to provide the best results for your beauty routine.
                      The lightweight, fast-absorbing formula leaves your skin feeling soft, smooth, and deeply nourished without any greasy residue.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-poppins font-medium mb-2">For Best Results</h4>
                        <p className="text-muted-foreground text-sm">
                          Apply morning and evening to clean, dry skin. Gently massage in upward, circular motions until fully absorbed.
                        </p>
                      </div>
                      
                      <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-poppins font-medium mb-2">Skin Types</h4>
                        <p className="text-muted-foreground text-sm">
                          Suitable for all skin types, especially beneficial for normal to dry skin. Dermatologist tested.
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="ingredients" className="py-4">
                    <h3 className="font-poppins font-medium text-lg mb-3">Ingredients</h3>
                    <p className="text-muted-foreground mb-4">
                      Aqua, Glycerin, Butylene Glycol, Sodium Hyaluronate, Panthenol, Aloe Barbadensis Leaf Juice, 
                      Tocopheryl Acetate, Allantoin, Camellia Sinensis Leaf Extract, Chamomilla Recutita Flower Extract,
                      Phenoxyethanol, Ethylhexylglycerin, Disodium EDTA, Sodium Hydroxide, Citric Acid.
                    </p>
                    
                    <div className="mt-4">
                      <h4 className="font-poppins font-medium mb-2">Key Ingredients</h4>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        <li><span className="font-medium">Hyaluronic Acid:</span> Provides intense hydration and plumps skin</li>
                        <li><span className="font-medium">Aloe Vera:</span> Soothes and calms irritated skin</li>
                        <li><span className="font-medium">Vitamin E:</span> Protects against environmental damage</li>
                        <li><span className="font-medium">Green Tea Extract:</span> Antioxidant properties</li>
                      </ul>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="how-to-use" className="py-4">
                    <h3 className="font-poppins font-medium text-lg mb-3">How to Use</h3>
                    <ol className="list-decimal list-inside text-muted-foreground space-y-3">
                      <li>Cleanse face thoroughly and pat dry.</li>
                      <li>If using serums, apply them before this product.</li>
                      <li>Take a small amount of product and warm between fingertips.</li>
                      <li>Gently apply to face and neck using upward, circular motions.</li>
                      <li>Allow to fully absorb before applying makeup or sunscreen.</li>
                    </ol>
                    
                    <div className="bg-muted p-4 rounded-lg mt-6">
                      <h4 className="font-poppins font-medium mb-2">Pro Tip</h4>
                      <p className="text-muted-foreground text-sm">
                        For enhanced results, use after our {product.category?.name} serum. During day time, always follow with SPF protection.
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="reviews" className="py-4">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="font-poppins font-medium text-lg mb-1">Customer Reviews</h3>
                        <div className="flex items-center">
                          <StarRating rating={avgRating} />
                          <span className="ml-2 text-sm text-muted-foreground">
                            Based on {reviews?.length || 0} {reviews?.length === 1 ? 'review' : 'reviews'}
                          </span>
                        </div>
                      </div>
                      
                      {user && (
                        <Button onClick={() => reviewForm.reset()}>Write a Review</Button>
                      )}
                    </div>
                    
                    {user && (
                      <Card className="mb-6">
                        <CardContent className="p-4">
                          <h4 className="font-poppins font-medium mb-4">Write a Review</h4>
                          <Form {...reviewForm}>
                            <form onSubmit={reviewForm.handleSubmit(onSubmitReview)} className="space-y-4">
                              <FormField
                                control={reviewForm.control}
                                name="rating"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Rating</FormLabel>
                                    <FormControl>
                                      <StarRating 
                                        rating={field.value} 
                                        size="lg" 
                                        interactive 
                                        onRatingChange={(rating) => field.onChange(rating)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={reviewForm.control}
                                name="title"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Review Title</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Summarize your experience" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={reviewForm.control}
                                name="comment"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Your Review</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        placeholder="Share your experience with this product..." 
                                        className="min-h-[100px]"
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <Button 
                                type="submit" 
                                disabled={submitReviewMutation.isPending}
                                className="w-full sm:w-auto"
                              >
                                {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                              </Button>
                            </form>
                          </Form>
                        </CardContent>
                      </Card>
                    )}
                    
                    {reviews && reviews.length > 0 ? (
                      <div className="space-y-4">
                        {reviews.map(review => (
                          <Card key={review.id}>
                            <CardContent className="p-4">
                              <div className="flex justify-between mb-2">
                                <h4 className="font-poppins font-medium">{review.title}</h4>
                                <StarRating rating={review.rating} />
                              </div>
                              <p className="text-muted-foreground mb-3">{review.comment}</p>
                              <div className="text-sm text-muted-foreground">
                                By {review.user?.username || 'Anonymous'} on {new Date(review.createdAt).toLocaleDateString()}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">This product doesn't have any reviews yet.</p>
                        {user ? (
                          <Button onClick={() => reviewForm.reset()}>Be the first to write a review</Button>
                        ) : (
                          <Button asChild>
                            <Link href="/auth">Sign in to write a review</Link>
                          </Button>
                        )}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Related Products */}
        <div className="mt-16">
          <h2 className="font-poppins font-semibold text-2xl mb-6">You May Also Like</h2>
          {product?.categoryId && (
            <ProductList categoryId={product.categoryId} />
          )}
        </div>
      </div>
    </main>
  );
}
