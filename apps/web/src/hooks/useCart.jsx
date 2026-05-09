import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { formatCurrency } from '@/api/EcommerceApi';

const CartContext = createContext();

const CART_STORAGE_KEY = 'e-commerce-cart';

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback((product, variant, quantity = 1, availableQuantity = 999) => {
    console.log('useCart.addToCart - Received Product:', product);
    console.log('useCart.addToCart - Received Variant:', variant);

    return new Promise((resolve, reject) => {
      // Handle standard ecommerce products with variants
      if (variant?.manage_inventory) {
        const existingItem = cartItems.find(item => item.variant.id === variant.id);
        const currentCartQuantity = existingItem ? existingItem.quantity : 0;
        if ((currentCartQuantity + quantity) > availableQuantity) {
          const error = new Error(`Not enough stock for ${product.title} (${variant.title}). Only ${availableQuantity} left.`);
          reject(error);
          return;
        }
      }

      setCartItems(prevItems => {
        // Create a normalized variant if one isn't provided (e.g., from PricingPage)
        const itemVariant = variant || {
          id: product.productId || product.id,
          title: 'Standard',
          price_in_cents: product.price,
          sale_price_in_cents: product.price,
          currency_info: { code: 'INR', symbol: '₹' }
        };

        // Validation: Ensure we have a valid variant ID
        if (!itemVariant || !itemVariant.id) {
          const error = new Error('Invalid variant data: variant ID is required');
          console.error('useCart.addToCart - Validation Error:', error);
          reject(error);
          return prevItems;
        }

        const normalizedProduct = {
          id: product.productId || product.id,
          title: product.productName || product.title || product.name,
          image: product.image || null,
          ...product
        };

        const existingItem = prevItems.find(item => item.variant.id === itemVariant.id);
        
        let newItems;
        if (existingItem) {
          newItems = prevItems.map(item =>
            item.variant.id === itemVariant.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          const finalItem = { product: normalizedProduct, variant: itemVariant, quantity };
          console.log('useCart.addToCart - Final Cart Item before storage:', finalItem);
          newItems = [...prevItems, finalItem];
        }
        
        return newItems;
      });
      
      setIsCartOpen(true);
      resolve(true);
    });
  }, [cartItems]);

  const removeFromCart = useCallback((variantId) => {
    setCartItems(prevItems => prevItems.filter(item => item.variant.id !== variantId));
  }, []);

  const updateQuantity = useCallback((variantId, quantity) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.variant.id === variantId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getCartTotal = useCallback(() => {
    if (cartItems.length === 0) return formatCurrency(0, { code: 'INR', symbol: '₹' });
    
    const totalInCents = cartItems.reduce((total, item) => {
      const price = item.variant.sale_price_in_cents ?? item.variant.price_in_cents;
      return total + price * item.quantity;
    }, 0);
    
    return formatCurrency(totalInCents, cartItems[0].variant.currency_info || { code: 'INR', symbol: '₹' });
  }, [cartItems]);

  const value = useMemo(() => ({
    cartItems,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
  }), [cartItems, isCartOpen, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
};