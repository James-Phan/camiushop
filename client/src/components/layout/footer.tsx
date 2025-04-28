import { Link } from "wouter";
import { Facebook, Instagram, Twitter, Linkedin, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-dark text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="text-primary font-poppins font-bold text-2xl">CAMIU</span>
              <span className="text-white font-poppins font-medium text-xl ml-1">Cosmetics</span>
            </Link>
            <p className="text-gray-400 mb-4 max-w-md">
              CAMIU Cosmetics is dedicated to creating high-quality beauty products that enhance your natural beauty while caring for your skin.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary transition">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-poppins font-medium text-lg mb-4">Shop</h3>
            <ul className="space-y-2">
              <li><Link href="/products?category=1" className="text-gray-400 hover:text-primary transition">Skincare</Link></li>
              <li><Link href="/products?category=2" className="text-gray-400 hover:text-primary transition">Makeup</Link></li>
              <li><Link href="/products?category=3" className="text-gray-400 hover:text-primary transition">Hair Care</Link></li>
              <li><Link href="/products?category=4" className="text-gray-400 hover:text-primary transition">Fragrances</Link></li>
              <li><Link href="/products" className="text-gray-400 hover:text-primary transition">Sets & Gifts</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-poppins font-medium text-lg mb-4">About</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-400 hover:text-primary transition">Our Story</Link></li>
              <li><Link href="/ingredients" className="text-gray-400 hover:text-primary transition">Ingredients</Link></li>
              <li><Link href="/sustainability" className="text-gray-400 hover:text-primary transition">Sustainability</Link></li>
              <li><Link href="/careers" className="text-gray-400 hover:text-primary transition">Careers</Link></li>
              <li><Link href="/press" className="text-gray-400 hover:text-primary transition">Press</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-poppins font-medium text-lg mb-4">Customer Care</h3>
            <ul className="space-y-2">
              <li><Link href="/contact" className="text-gray-400 hover:text-primary transition">Contact Us</Link></li>
              <li><Link href="/faqs" className="text-gray-400 hover:text-primary transition">FAQs</Link></li>
              <li><Link href="/shipping" className="text-gray-400 hover:text-primary transition">Shipping & Returns</Link></li>
              <li><Link href="/track-order" className="text-gray-400 hover:text-primary transition">Track Order</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-primary transition">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-800 text-center sm:flex sm:justify-between sm:text-left">
          <p className="text-gray-400 text-sm mb-4 sm:mb-0">&copy; {new Date().getFullYear()} CAMIU Cosmetics. All rights reserved.</p>
          <div className="flex flex-wrap justify-center sm:justify-end gap-4">
            <Link href="/terms" className="text-gray-400 hover:text-primary transition text-sm">Terms of Service</Link>
            <Link href="/privacy" className="text-gray-400 hover:text-primary transition text-sm">Privacy Policy</Link>
            <Link href="/cookies" className="text-gray-400 hover:text-primary transition text-sm">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
