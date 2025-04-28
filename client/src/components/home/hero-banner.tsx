import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function HeroBanner() {
  return (
    <section className="relative bg-gradient-to-r from-primary/10 to-secondary/10 py-12 mb-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="font-poppins font-bold text-3xl md:text-4xl lg:text-5xl mb-4">Discover Your Perfect Beauty Routine</h1>
            <p className="text-muted-foreground mb-6 max-w-lg">Explore CAMIU's premium collection of beauty and skincare products designed to bring out your natural radiance.</p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="rounded-full">
                <Link href="/products">Shop Now</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full">
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&h=600" 
              alt="Beauty products showcase" 
              className="rounded-lg shadow-lg w-full" 
            />
          </div>
        </div>
      </div>
    </section>
  );
}
