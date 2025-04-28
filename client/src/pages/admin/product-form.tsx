import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ProductWithDetails, Category } from "@/lib/types";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowLeft, Save, Trash2 } from "lucide-react";

// Form schema with validation
const productFormSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be a positive number"),
  salePrice: z.coerce.number().positive("Sale price must be a positive number").nullable().optional(),
  image: z.string().url("Image URL must be valid"),
  images: z.array(z.string().url("Each image URL must be valid")).optional(),
  categoryId: z.coerce.number().positive("Please select a category"),
  stock: z.coerce.number().nonnegative("Stock must be 0 or greater"),
  featured: z.boolean().default(false),
  new: z.boolean().default(false),
  bestseller: z.boolean().default(false),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function ProductForm() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const isEditMode = !!id;
  
  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Fetch product data if in edit mode
  const { data: product, isLoading: isLoadingProduct } = useQuery<ProductWithDetails>({
    queryKey: [`/api/products/${id}`],
    enabled: isEditMode,
    onSuccess: (data) => {
      if (data.images && data.images.length > 0) {
        setAdditionalImages(data.images);
      }
    }
  });
  
  // Initialize form
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      salePrice: null,
      image: "",
      images: [],
      categoryId: 0,
      stock: 0,
      featured: false,
      new: false,
      bestseller: false,
    },
  });
  
  // Set form values when product data is loaded
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description,
        price: product.price,
        salePrice: product.salePrice,
        image: product.image,
        images: product.images || [],
        categoryId: product.categoryId,
        stock: product.stock,
        featured: product.featured,
        new: product.new,
        bestseller: product.bestseller,
      });
      
      if (product.images) {
        setAdditionalImages(product.images);
      }
    }
  }, [product, form]);
  
  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      const response = await apiRequest("POST", "/api/products", {
        ...data,
        images: additionalImages.length > 0 ? additionalImages : undefined,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Product created",
        description: "The product has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      navigate("/admin/products");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create product: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      const response = await apiRequest("PUT", `/api/products/${id}`, {
        ...data,
        images: additionalImages.length > 0 ? additionalImages : undefined,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Product updated",
        description: "The product has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: [`/api/products/${id}`] });
      navigate("/admin/products");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update product: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: ProductFormValues) => {
    // Include additional images
    const productData = {
      ...data,
      images: additionalImages,
    };
    
    if (isEditMode) {
      updateProductMutation.mutate(productData);
    } else {
      createProductMutation.mutate(productData);
    }
  };
  
  // Handle adding additional image
  const handleAddImage = () => {
    if (newImageUrl && newImageUrl.trim() !== "") {
      setAdditionalImages([...additionalImages, newImageUrl]);
      setNewImageUrl("");
    }
  };
  
  // Handle removing an image
  const handleRemoveImage = (index: number) => {
    const updatedImages = [...additionalImages];
    updatedImages.splice(index, 1);
    setAdditionalImages(updatedImages);
  };
  
  // Show loading state while fetching product data
  if (isEditMode && isLoadingProduct) {
    return (
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading product data...</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/admin/products")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
          <h1 className="font-poppins font-bold text-2xl">
            {isEditMode ? "Edit Product" : "Add New Product"}
          </h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{isEditMode ? "Edit Product Details" : "New Product Details"}</CardTitle>
            <CardDescription>
              {isEditMode 
                ? "Update the information for this product" 
                : "Fill in the details to create a new product"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name*</FormLabel>
                          <FormControl>
                            <Input placeholder="Hydrating Facial Cream" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description*</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="A deeply hydrating face cream that nourishes and revitalizes dry skin..." 
                              className="min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category*</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value.toString()}
                            value={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories?.map(category => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Pricing and Stock */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Regular Price*</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="salePrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sale Price</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0" 
                                step="0.01" 
                                placeholder="Leave empty for no sale"
                                value={field.value?.toString() || ""} 
                                onChange={(e) => {
                                  const value = e.target.value;
                                  field.onChange(value === "" ? null : parseFloat(value));
                                }}
                              />
                            </FormControl>
                            <FormDescription>
                              Optional. Leave empty if the product is not on sale.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock Quantity*</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="featured"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Featured</FormLabel>
                              <FormDescription>
                                Show on homepage
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="new"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>New</FormLabel>
                              <FormDescription>
                                Mark as new product
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="bestseller"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Bestseller</FormLabel>
                              <FormDescription>
                                Mark as bestseller
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Images Section */}
                <div className="space-y-6">
                  <h3 className="font-poppins font-medium text-lg">Product Images</h3>
                  
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Main Product Image URL*</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormDescription>
                          This will be the primary image shown on product listings.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {form.watch("image") && (
                    <div className="w-32 h-32 border rounded-md overflow-hidden">
                      <img 
                        src={form.watch("image")} 
                        alt="Main product preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://placehold.co/400x400?text=Image+Error";
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Additional Images (Gallery)</h4>
                    
                    <div className="flex gap-4">
                      <Input 
                        placeholder="Image URL" 
                        value={newImageUrl} 
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        className="flex-grow"
                      />
                      <Button 
                        type="button" 
                        onClick={handleAddImage}
                        disabled={!newImageUrl}
                      >
                        Add Image
                      </Button>
                    </div>
                    
                    {additionalImages.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                        {additionalImages.map((url, index) => (
                          <div key={index} className="relative group">
                            <div className="w-full h-32 border rounded-md overflow-hidden">
                              <img 
                                src={url} 
                                alt={`Product gallery image ${index + 1}`} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = "https://placehold.co/400x400?text=Image+Error";
                                }}
                              />
                            </div>
                            <Button 
                              variant="destructive" 
                              size="icon"
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleRemoveImage(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <Button 
                    variant="outline" 
                    type="button"
                    onClick={() => navigate("/admin/products")}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createProductMutation.isPending || updateProductMutation.isPending}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {createProductMutation.isPending || updateProductMutation.isPending
                      ? "Saving..."
                      : isEditMode
                        ? "Update Product"
                        : "Create Product"
                    }
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
