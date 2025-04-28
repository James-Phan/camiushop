import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Trash2, ShoppingBag, Minus, Plus } from "lucide-react";

export default function CartPage() {
  const { user } = useAuth();
  const { 
    cartItems, 
    isLoading, 
    updateCartItem, 
    removeFromCart, 
    clearCart, 
    itemCount, 
    cartTotal,
    isUpdating
  } = useCart();

  return (
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="font-poppins font-bold text-2xl mb-6">Shopping Cart</h1>
        
        {!user ? (
          <Card>
            <CardContent className="p-12 flex flex-col items-center justify-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="font-poppins font-medium text-xl mb-4">Please sign in to view your cart</h2>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                You need to be logged in to add items to your cart and proceed to checkout.
              </p>
              <Button asChild size="lg">
                <Link href="/auth">Sign In / Register</Link>
              </Button>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <Card>
            <CardContent className="p-12 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading your cart...</p>
            </CardContent>
          </Card>
        ) : cartItems?.length === 0 || !cartItems ? (
          <Card>
            <CardContent className="p-12 flex flex-col items-center justify-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="font-poppins font-medium text-xl mb-4">Your cart is empty</h2>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Looks like you haven't added any products to your cart yet.
                Browse our products and start shopping!
              </p>
              <Button asChild size="lg">
                <Link href="/products">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <Card>
                <CardHeader className="px-6">
                  <CardTitle>Cart Items ({itemCount})</CardTitle>
                </CardHeader>
                <CardContent className="px-6">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center py-6 border-b last:border-0">
                      <div className="w-full sm:w-24 h-24 rounded-md overflow-hidden flex-shrink-0 mb-4 sm:mb-0">
                        <img 
                          src={item.product.image} 
                          alt={item.product.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="flex-grow sm:ml-6">
                        <Link href={`/products/${item.product.id}`} className="font-poppins font-medium hover:text-primary transition">
                          {item.product.name}
                        </Link>
                        <div className="text-sm text-muted-foreground mb-2">
                          {item.variant && <span>{item.variant} • </span>}
                          <span>${(item.product.salePrice || item.product.price).toFixed(2)}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-3">
                          <div className="flex items-center border rounded">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 p-0"
                              onClick={() => updateCartItem(item.id, Math.max(1, item.quantity - 1))}
                              disabled={item.quantity <= 1 || isUpdating}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 p-0"
                              onClick={() => updateCartItem(item.id, item.quantity + 1)}
                              disabled={isUpdating}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeFromCart(item.id)}
                            disabled={isUpdating}
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Remove
                          </Button>
                        </div>
                      </div>
                      <div className="font-poppins font-medium text-right mt-4 sm:mt-0 w-full sm:w-auto sm:ml-4">
                        ${((item.product.salePrice || item.product.price) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="px-6 flex flex-wrap justify-between gap-4">
                  <Button variant="outline" onClick={() => clearCart()} disabled={isUpdating}>
                    Clear Cart
                  </Button>
                  <Button asChild>
                    <Link href="/products">Continue Shopping</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            {/* Order Summary */}
            <div className="lg:w-1/3">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <Input 
                      placeholder="Promo code" 
                      className="flex-grow" 
                    />
                    <Button variant="outline">Apply</Button>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-poppins font-medium text-lg">
                    <span>Total</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full" disabled={cartItems.length === 0}>
                    <Link href="/checkout">Proceed to Checkout</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
