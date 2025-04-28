import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CartSidebar from "@/components/cart/cart-sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  User,
  Search,
  ShoppingBag,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { openCart, itemCount } = useCart();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-primary font-poppins font-bold text-2xl">CAMIU</span>
              <span className="text-foreground font-poppins font-medium text-xl ml-1">Cosmetics</span>
            </Link>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex space-x-8">
              <Link 
                href="/" 
                className={`font-poppins font-medium ${location === '/' ? 'text-primary' : 'text-foreground hover:text-primary'} transition`}
              >
                Home
              </Link>
              <div className="relative group">
                <Link 
                  href="/products" 
                  className={`font-poppins font-medium ${location === '/products' ? 'text-primary' : 'text-foreground hover:text-primary'} transition flex items-center`}
                >
                  Products <ChevronDown className="ml-1 h-4 w-4" />
                </Link>
                <div className="absolute z-10 left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <Link href="/products?category=1" className="block px-4 py-2 text-sm text-foreground hover:bg-light hover:text-primary" role="menuitem">Skincare</Link>
                    <Link href="/products?category=2" className="block px-4 py-2 text-sm text-foreground hover:bg-light hover:text-primary" role="menuitem">Makeup</Link>
                    <Link href="/products?category=3" className="block px-4 py-2 text-sm text-foreground hover:bg-light hover:text-primary" role="menuitem">Hair Care</Link>
                    <Link href="/products?category=4" className="block px-4 py-2 text-sm text-foreground hover:bg-light hover:text-primary" role="menuitem">Fragrances</Link>
                  </div>
                </div>
              </div>
              <Link 
                href="/about" 
                className="font-poppins font-medium text-foreground hover:text-primary transition"
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className="font-poppins font-medium text-foreground hover:text-primary transition"
              >
                Contact
              </Link>
            </nav>

            {/* Search, Cart & User Icons */}
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-foreground hover:text-primary transition"
              >
                <Search className="h-5 w-5" />
              </Button>

              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={openCart}
                  className="text-foreground hover:text-primary transition"
                >
                  <ShoppingBag className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-foreground hover:text-primary transition"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {user ? (
                    <>
                      <DropdownMenuLabel>Hi, {user.username}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {user.isAdmin && (
                        <>
                          <DropdownMenuItem>
                            <Link href="/admin" className="w-full">Admin Dashboard</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem>
                        <Link href="/account" className="w-full">My Account</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href="/orders" className="w-full">Orders</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href="/wishlist" className="w-full">Wishlist</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                        Sign Out
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem>
                      <Link href="/auth" className="w-full">Sign In / Register</Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Toggle */}
              <Button 
                variant="ghost" 
                size="icon"
                className="md:hidden text-foreground hover:text-primary transition"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          {isSearchOpen && (
            <div className="py-4">
              <div className="relative">
                <Input 
                  type="text" 
                  placeholder="Search for products..." 
                  className="w-full py-2 px-4 pr-10 rounded-full"
                />
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white">
            <nav className="flex flex-col px-4 py-2">
              <Link 
                href="/" 
                className={`py-2 font-poppins font-medium ${location === '/' ? 'text-primary' : 'text-foreground hover:text-primary'} transition`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <div className="py-2">
                <Link 
                  href="/products" 
                  className={`flex items-center justify-between w-full font-poppins font-medium ${location === '/products' ? 'text-primary' : 'text-foreground hover:text-primary'} transition`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Products
                </Link>
                <div className="pl-4 mt-2 space-y-2">
                  <Link 
                    href="/products?category=1" 
                    className="block py-1 text-foreground hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Skincare
                  </Link>
                  <Link 
                    href="/products?category=2" 
                    className="block py-1 text-foreground hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Makeup
                  </Link>
                  <Link 
                    href="/products?category=3" 
                    className="block py-1 text-foreground hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Hair Care
                  </Link>
                  <Link 
                    href="/products?category=4" 
                    className="block py-1 text-foreground hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Fragrances
                  </Link>
                </div>
              </div>
              <Link 
                href="/about" 
                className="py-2 font-poppins font-medium text-foreground hover:text-primary transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className="py-2 font-poppins font-medium text-foreground hover:text-primary transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="border-t border-gray-200 mt-2 pt-2">
                {user ? (
                  <>
                    {user.isAdmin && (
                      <Link 
                        href="/admin" 
                        className="py-2 flex items-center text-foreground hover:text-primary transition"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <i className="ri-dashboard-line mr-2"></i> Admin Dashboard
                      </Link>
                    )}
                    <Link 
                      href="/account" 
                      className="py-2 flex items-center text-foreground hover:text-primary transition"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <i className="ri-user-line mr-2"></i> My Account
                    </Link>
                    <Link 
                      href="/orders" 
                      className="py-2 flex items-center text-foreground hover:text-primary transition"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <i className="ri-file-list-line mr-2"></i> Orders
                    </Link>
                    <Link 
                      href="/wishlist" 
                      className="py-2 flex items-center text-foreground hover:text-primary transition"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <i className="ri-heart-line mr-2"></i> Wishlist
                    </Link>
                    <button 
                      className="py-2 flex items-center text-foreground hover:text-primary transition w-full text-left"
                      onClick={() => {
                        logoutMutation.mutate();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <i className="ri-logout-box-line mr-2"></i> Sign Out
                    </button>
                  </>
                ) : (
                  <Link 
                    href="/auth" 
                    className="py-2 flex items-center text-foreground hover:text-primary transition"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <i className="ri-user-line mr-2"></i> Sign In / Register
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      <CartSidebar />
    </>
  );
}
