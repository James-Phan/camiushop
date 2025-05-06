import { useState } from "react";
import { useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Landmark, Truck, Check, AlertCircle } from "lucide-react";

// Form validation schema
const checkoutFormSchema = z.object({
  // Shipping information
  fullName: z.string().min(3, "Full name is required"),
  addressLine1: z.string().min(3, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(3, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
  phone: z.string().min(5, "Phone number is required"),
  
  // Payment information
  paymentMethod: z.enum(["credit_card", "bank_transfer", "cash_on_delivery"]),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { cartItems, itemCount, cartTotal, clearCart } = useCart();
  const { toast } = useToast();
  const [orderProcessing, setOrderProcessing] = useState(false);
  
  // Initialize form
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      fullName: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "US",
      phone: "",
      paymentMethod: "credit_card",
    },
  });
  
  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (data: CheckoutFormValues) => {
      // Add additional checkout data
      const orderData = {
        shippingAddress: {
          fullName: data.fullName,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
          phone: data.phone,
        },
        paymentMethod: data.paymentMethod,
      };
      
      const res = await apiRequest("POST", "/api/orders", orderData);
      return await res.json();
    },
    onSuccess: () => {
      setOrderProcessing(false);
      // Clear cart and redirect to confirmation
      clearCart();
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      
      toast({
        title: "Order placed successfully!",
        description: "Thank you for your purchase.",
      });
      
      // Set confirmation flag and order info in session storage
      sessionStorage.setItem('fromCheckout', 'true');
      
      try {
        navigate("/confirmation");
      } catch (error) {
        console.error("Navigation error:", error);
        // Force reload to confirmation page as fallback
        window.location.href = "/confirmation";
      }
    },
    onError: (error: Error) => {
      setOrderProcessing(false);
      toast({
        title: "Failed to place order",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (data: CheckoutFormValues) => {
    if (!cartItems || cartItems.length === 0) {
      toast({
        title: "Empty cart",
        description: "Your cart is empty. Add some products before checking out.",
        variant: "destructive",
      });
      return;
    }
    
    // Process order
    setOrderProcessing(true);
    createOrderMutation.mutate(data);
  };
  
  if (!user) {
    navigate("/auth?redirect=checkout");
    return null;
  }
  
  if (!cartItems || cartItems.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="font-poppins font-bold text-2xl mb-6">Checkout</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Checkout Form */}
          <div className="lg:w-2/3">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Truck className="mr-2 h-5 w-5" />
                      Shipping Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name*</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="addressLine1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Line 1*</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="addressLine2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Line 2</FormLabel>
                          <FormControl>
                            <Input placeholder="Apt 4B" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City*</FormLabel>
                            <FormControl>
                              <Input placeholder="New York" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State/Province*</FormLabel>
                            <FormControl>
                              <Input placeholder="NY" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code*</FormLabel>
                            <FormControl>
                              <Input placeholder="10001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country*</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a country" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="US">United States</SelectItem>
                                <SelectItem value="CA">Canada</SelectItem>
                                <SelectItem value="UK">United Kingdom</SelectItem>
                                <SelectItem value="AU">Australia</SelectItem>
                                <SelectItem value="DE">Germany</SelectItem>
                                <SelectItem value="FR">France</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number*</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 234 567 8900" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="mr-2 h-5 w-5" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="space-y-3"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="credit_card" />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer flex items-center">
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  Credit / Debit Card
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="bank_transfer" />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer flex items-center">
                                  <Landmark className="mr-2 h-4 w-4" />
                                  Bank Transfer
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="cash_on_delivery" />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  Cash on Delivery
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {form.watch("paymentMethod") === "credit_card" && (
                      <div className="mt-4 p-4 bg-muted rounded-md">
                        <div className="text-sm text-muted-foreground mb-2 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Demo Mode: No real payment will be processed
                        </div>
                        <div className="grid gap-4">
                          <Input placeholder="Card Number: 4242 4242 4242 4242" disabled />
                          <div className="grid grid-cols-2 gap-4">
                            <Input placeholder="MM/YY: 12/25" disabled />
                            <Input placeholder="CVC: 123" disabled />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea 
                      placeholder="Order notes (optional)" 
                      className="min-h-[100px]"
                    />
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={orderProcessing}
                    >
                      {orderProcessing ? "Processing order..." : "Place Order"}
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </Form>
          </div>
          
          {/* Order Summary */}
          <div className="lg:w-1/3">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Accordion type="single" collapsible defaultValue="items">
                  <AccordionItem value="items">
                    <AccordionTrigger>
                      Items ({itemCount})
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        {cartItems?.map(item => (
                          <div key={item.id} className="flex justify-between items-center pb-2 border-b last:border-0">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-md overflow-hidden mr-3">
                                <img 
                                  src={item.product.image} 
                                  alt={item.product.name} 
                                  className="w-full h-full object-cover" 
                                />
                              </div>
                              <div>
                                <div className="font-medium text-sm">{item.product.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {item.variant && `${item.variant} • `}
                                  Qty: {item.quantity}
                                </div>
                              </div>
                            </div>
                            <div className="font-medium">
                              ${((item.product.salePrice || item.product.price) * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>$0.00</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-poppins font-medium text-lg">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                
                <div className="bg-muted p-4 rounded-md text-sm space-y-2">
                  <div className="flex items-center">
                    <Check className="text-secondary h-4 w-4 mr-2" />
                    <span>Free shipping on all orders</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="text-secondary h-4 w-4 mr-2" />
                    <span>30-day money-back guarantee</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="text-secondary h-4 w-4 mr-2" />
                    <span>Secure checkout</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
