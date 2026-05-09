
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/hooks/useAuth.js';
import { useToast } from '@/hooks/use-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCart = useCallback(async () => {
    if (!currentUser) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    try {
      const records = await pb.collection('cart').getFullList({
        filter: `userId = "${currentUser.id}"`,
        sort: '-created',
        $autoCancel: false
      });
      setItems(records);
    } catch (error) {
      console.error("Failed to load cart:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const addToCart = async (product) => {
    console.log("Attempting to add item to cart:", product);
    
    if (!currentUser) {
      console.log("Add to cart failed: User not authenticated");
      toast({ 
        title: "Authentication Required", 
        description: "Please log in to add items to your cart.", 
        variant: "destructive" 
      });
      return false;
    }

    try {
      // Check if item already exists in cart for this user
      const existingItems = await pb.collection('cart').getFullList({
        filter: `userId="${currentUser.id}" && productId="${product.productId}"`,
        $autoCancel: false
      });

      if (existingItems.length > 0) {
        // Update existing item
        const existingItem = existingItems[0];
        const newQty = existingItem.quantity + 1;
        
        console.log("Updating existing cart item:", existingItem.id);
        await pb.collection('cart').update(existingItem.id, {
          quantity: newQty,
          totalPrice: newQty * product.price
        }, { $autoCancel: false });
        
        toast({ 
          title: "Cart Updated", 
          description: `Increased quantity of ${product.productName} to ${newQty}.` 
        });
      } else {
        // Create new cart item with all required fields
        console.log("Creating new cart item for user:", currentUser.id);
        await pb.collection('cart').create({
          userId: currentUser.id,
          productId: product.productId,
          productName: product.productName,
          productType: product.productType || 'product',
          quantity: 1,
          price: product.price,
          totalPrice: product.price,
          addOns: [],
          addOnsPrice: 0,
          notes: ''
        }, { $autoCancel: false });
        
        console.log("Cart item created successfully");
        toast({ 
          title: "Added to Cart", 
          description: `${product.productName} has been added to your cart.` 
        });
      }
      
      await loadCart();
      return true;
    } catch (error) {
      console.error("Add to cart error details:", error);
      toast({ 
        title: "Cart Error", 
        description: "Failed to add item to cart. Please try again later.", 
        variant: "destructive" 
      });
      return false;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await pb.collection('cart').delete(itemId, { $autoCancel: false });
      await loadCart();
      toast({ 
        title: "Item Removed", 
        description: "The item has been removed from your cart." 
      });
    } catch (error) {
      console.error("Remove from cart error:", error);
      toast({ 
        title: "Error", 
        description: "Failed to remove item.", 
        variant: "destructive" 
      });
    }
  };

  const updateQuantity = async (itemId, newQty, price) => {
    if (newQty < 1) return;
    try {
      await pb.collection('cart').update(itemId, {
        quantity: newQty,
        totalPrice: newQty * price
      }, { $autoCancel: false });
      await loadCart();
    } catch (error) {
      console.error("Update quantity error:", error);
      toast({ 
        title: "Error", 
        description: "Failed to update quantity.", 
        variant: "destructive" 
      });
    }
  };

  const clearCart = async () => {
    if (!currentUser) return;
    try {
      const records = await pb.collection('cart').getFullList({
        filter: `userId="${currentUser.id}"`,
        $autoCancel: false
      });
      
      await Promise.all(records.map(record => 
        pb.collection('cart').delete(record.id, { $autoCancel: false })
      ));
      
      setItems([]);
    } catch (error) {
      console.error("Clear cart error:", error);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  return (
    <CartContext.Provider value={{
      items,
      isLoading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      refreshCart: loadCart,
      subtotal,
      tax,
      total
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
