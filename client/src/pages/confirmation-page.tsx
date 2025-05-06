import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Check, ShoppingBag, ArrowRight } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function ConfirmationPage() {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  
  // Redirect if user directly navigates to this page without checkout
  useEffect(() => {
    const fromCheckout = sessionStorage.getItem('fromCheckout');
    
    // Simulate loading for better UX even if there's a database issue
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    if (fromCheckout !== 'true') {
      navigate('/');
    }
    
    // Clean up
    return () => {
      clearTimeout(timer);
      sessionStorage.removeItem('fromCheckout');
    };
  }, [navigate]);

  // Show loading state
  if (isLoading) {
    return (
      <main className="pt-24 pb-16 min-h-screen">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex flex-col items-center justify-center text-center h-[50vh]">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h2 className="text-xl font-medium">Processing your order...</h2>
            <p className="text-muted-foreground mt-2">Please wait while we confirm your purchase.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex flex-col items-center text-center">
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Check className="h-12 w-12 text-primary" />
          </div>
          
          <h1 className="font-poppins font-bold text-3xl mb-2">Order Confirmed!</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
          
          <div className="w-full bg-muted p-8 rounded-lg mb-8">
            <h2 className="font-medium text-xl mb-4">What happens next?</h2>
            <ol className="space-y-4 text-left">
              <li className="flex">
                <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3 flex-shrink-0">1</span>
                <span>We're preparing your order for shipment. You'll receive an email with tracking information once your order ships.</span>
              </li>
              <li className="flex">
                <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3 flex-shrink-0">2</span>
                <span>Delivery typically takes 3-5 business days depending on your location.</span>
              </li>
              <li className="flex">
                <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3 flex-shrink-0">3</span>
                <span>If you have any questions about your order, please contact our customer service team.</span>
              </li>
            </ol>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <Button asChild variant="outline" size="lg" className="flex-1">
              <Link href="/products">
                <ShoppingBag className="mr-2 h-4 w-4" /> Continue Shopping
              </Link>
            </Button>
            <Button asChild size="lg" className="flex-1">
              <Link href="/">
                Go to Home <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}