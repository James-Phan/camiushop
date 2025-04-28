import React from "react";
import HeroBanner from "@/components/home/hero-banner";
import CategorySection from "@/components/home/category-section";
import FeaturedCollection from "@/components/home/featured-collection";
import ReviewsSection from "@/components/home/reviews-section";
import NewsletterSection from "@/components/home/newsletter-section";
import ProductList from "@/components/product/product-list";

export default function HomePage() {
  return (
    <main className="pt-24 pb-16">
      {/* Hero Banner */}
      <HeroBanner />
      
      {/* Categories */}
      <CategorySection />
      
      {/* Featured Products */}
      <section className="mb-16">
        <div className="container mx-auto px-4">
          <ProductList featured={true} />
        </div>
      </section>
      
      {/* Featured Collection */}
      <FeaturedCollection />
      
      {/* User Reviews */}
      <ReviewsSection />
      
      {/* Newsletter */}
      <NewsletterSection />
    </main>
  );
}
