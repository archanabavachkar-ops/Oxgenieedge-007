import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart as ShoppingCartIcon, X, Loader2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { initializeCheckout } from '@/api/EcommerceApi';
import { useToast } from '@/hooks/use-toast';

const ShoppingCart = ({ isCartOpen, setIsCartOpen }) => {
  const { toast } = useToast();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = useCallback(async () => {
    if (cartItems.length === 0) {
      toast({
        title: 'Your cart is empty',
        description: 'Add some products to your cart before checking out.',
        variant: 'destructive',
      });
      return;
    }

    setIsCheckingOut(true);

    try {
      // Normalize and validate items before sending to API
      const items = cartItems.map(item => {
        console.log(`ShoppingCart - Processing item for checkout: Product ID: ${item.product.id}, Variant ID: ${item.variant.id}`);
        
        if (!item.variant || !item.variant.id) {
          throw new Error(`Missing variant ID for product: ${item.product.title}`);
        }

        return {
          variant_id: String(item.variant.id), // Ensure it's a string as expected by the API
          quantity: Number(item.quantity),
        };
      });

      const successUrl = `${window.location.origin}/success`;
      const cancelUrl = window.location.href;

      const payload = { items, successUrl, cancelUrl };
      console.log('ShoppingCart - Complete Checkout Payload:', JSON.stringify(payload, null, 2));

      const response = await initializeCheckout(payload);
      console.log('Checkout API Response Object:', response);

      const { url } = response;
      console.log('Extracted Redirect URL:', url);

      if (!url) {
        throw new Error('No redirect URL returned from checkout API');
      }

      toast({
        title: 'Redirecting...',
        description: 'Taking you to the secure payment gateway.',
      });

      console.log('Executing redirect to:', url);
      clearCart();
      window.location.href = url;
    } catch (error) {
      console.error('Checkout initialization failed:', error);
      toast({
        title: 'Checkout Error',
        description: error.message || 'There was a problem initializing checkout. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCheckingOut(false);
    }
  }, [cartItems, clearCart, toast]);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-foreground/60 z-50"
          onClick={() => setIsCartOpen(false)}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute right-0 top-0 h-full w-full max-w-md bg-card text-card-foreground shadow-2xl flex flex-col rounded-l-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-2xl font-bold text-card-foreground">Shopping Cart</h2>
              <Button onClick={() => setIsCartOpen(false)} variant="ghost" size="icon" className="text-card-foreground hover:bg-muted">
                <X />
              </Button>
            </div>
            <div className="flex-grow p-6 overflow-y-auto space-y-4">
              {cartItems.length === 0 ? (
                <div className="text-center text-muted-foreground h-full flex flex-col items-center justify-center">
                  <ShoppingCartIcon size={48} className="mb-4" />
                  <p>Your cart is empty.</p>
                </div>
              ) : (
                cartItems.map(item => (
                  <div key={item.variant.id} className="flex items-center gap-4 bg-card border border-border p-3 rounded-lg">
                    {item.product.image && (
                      <img src={item.product.image} alt={item.product.title} className="w-20 h-20 object-cover rounded-md" />
                    )}
                    <div className="flex-grow">
                      <h3 className="font-semibold text-card-foreground">{item.product.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.variant.title}</p>
                      <p className="text-sm text-primary font-bold">
                        {item.variant.sale_price_formatted || item.variant.price_formatted || `₹${(item.variant.price_in_cents / 100).toFixed(2)}`}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center border border-border rounded-md">
                        <Button onClick={() => updateQuantity(item.variant.id, Math.max(1, item.quantity - 1))} size="sm" variant="ghost" className="px-2 text-card-foreground hover:bg-muted">-</Button>
                        <span className="px-2 text-card-foreground">{item.quantity}</span>
                        <Button onClick={() => updateQuantity(item.variant.id, item.quantity + 1)} size="sm" variant="ghost" className="px-2 text-card-foreground hover:bg-muted">+</Button>
                      </div>
                      <Button onClick={() => removeFromCart(item.variant.id)} size="sm" variant="ghost" className="text-destructive hover:text-destructive/90 text-xs">Remove</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-border">
                <div className="flex justify-between items-center mb-4 text-card-foreground">
                  <span className="text-lg font-medium">Total</span>
                  <span className="text-2xl font-bold">{getCartTotal()}</span>
                </div>
                <Button 
                  onClick={handleCheckout} 
                  disabled={cartItems.length === 0 || isCheckingOut}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 text-base transition-all duration-200 active:scale-[0.98]"
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Proceed to Checkout'
                  )}
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShoppingCart;