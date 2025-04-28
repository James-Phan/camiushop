import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function CartSidebar() {
  const { 
    cartItems, 
    isCartOpen, 
    closeCart, 
    updateCartItem, 
    removeFromCart, 
    itemCount, 
    cartTotal 
  } = useCart();
  const { user } = useAuth();

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${isCartOpen ? "block" : "hidden"}`}>
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-background shadow-lg transform transition-transform duration-300 ease-in-out cart-sidebar ${!isCartOpen ? 'translate-x-full' : 'translate-x-0'}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-poppins font-medium text-lg">Your Cart ({itemCount})</h3>
            <Button variant="ghost" size="icon" onClick={closeCart}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          
          {!user ? (
            <div className="flex-grow flex flex-col items-center justify-center p-4">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="font-poppins font-medium text-lg mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground text-center mb-4">Please log in to add items to your cart</p>
              <Button asChild onClick={closeCart}>
                <Link href="/auth">Sign In / Register</Link>
              </Button>
            </div>
          ) : cartItems?.length === 0 || !cartItems ? (
            <div className="flex-grow flex flex-col items-center justify-center p-4">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="font-poppins font-medium text-lg mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground text-center mb-4">Add some items to your cart to get started</p>
              <Button onClick={closeCart}>Continue Shopping</Button>
            </div>
          ) : (
            <>
              <div className="flex-grow overflow-y-auto py-4 px-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center py-4 border-b">
                    <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                      <img 
                        src={item.product.image} 
                        alt={item.product.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="ml-4 flex-grow">
                      <h4 className="font-poppins font-medium text-sm">{item.product.name}</h4>
                      {item.variant && (
                        <div className="text-xs text-muted-foreground">{item.variant}</div>
                      )}
                      <div className="flex items-center mt-1">
                        <div className="flex items-center border rounded">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="w-6 h-6 p-0"
                            onClick={() => updateCartItem(item.id, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                            <span className="sr-only">Decrease quantity</span>
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="w-6 h-6 p-0"
                            onClick={() => updateCartItem(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                            <span className="sr-only">Increase quantity</span>
                          </Button>
                        </div>
                        <div className="ml-auto font-poppins font-medium">
                          ${((item.product.salePrice || item.product.price) * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="ml-2 text-muted-foreground hover:text-destructive"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-poppins font-medium">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-poppins font-medium">Free</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-poppins font-medium mb-6">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                
                <Button asChild className="w-full mb-3" onClick={closeCart}>
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={closeCart}
                >
                  Continue Shopping
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
