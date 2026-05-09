import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, PackagePlus, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CouponInput from '@/components/CouponInput';
import { Skeleton } from '@/components/ui/skeleton';

const CartPage = () => {
  const { currentUser } = useAuth();
  const { refreshCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const fetchCartItems = async () => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const records = await pb.collection('cart').getFullList({
        filter: `userId="${currentUser.id}"`,
        sort: '-created',
        $autoCancel: false
      });
      setItems(records);
      refreshCart(); // Keep context in sync for header badge
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError("Failed to load your cart items.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [currentUser]);

  const handleUpdateQuantity = async (itemId, currentQty, price, change) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;

    setProcessingId(itemId);
    try {
      await pb.collection('cart').update(itemId, {
        quantity: newQty,
        totalPrice: newQty * price
      }, { $autoCancel: false });
      
      // Optimistic update
      setItems(items.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQty, totalPrice: newQty * price } 
          : item
      ));
      refreshCart();
    } catch (err) {
      console.error("Error updating quantity:", err);
      toast({
        title: "Update Failed",
        description: "Could not update item quantity.",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteItem = async (itemId) => {
    setProcessingId(itemId);
    try {
      await pb.collection('cart').delete(itemId, { $autoCancel: false });
      setItems(items.filter(item => item.id !== itemId));
      refreshCart();
      toast({
        title: "Item Removed",
        description: "The item has been removed from your cart."
      });
    } catch (err) {
      console.error("Error deleting item:", err);
      toast({
        title: "Delete Failed",
        description: "Could not remove the item from your cart.",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  if (!currentUser) {
    return (
      <>
        <Helmet><title>Your Cart - OxgenieEdge</title></Helmet>
        <Header />
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-gray-50">
          <div className="w-24 h-24 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Authentication Required</h2>
          <p className="text-gray-500 mb-8 text-center max-w-md">
            Please log in to view and manage your shopping cart.
          </p>
          <Link
            to="/login"
            className="px-8 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-all duration-200 shadow-sm"
          >
            Log In
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <Helmet><title>Loading Cart - OxgenieEdge</title></Helmet>
        <Header />
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-10 w-48 mb-8" />
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1 space-y-4">
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
              </div>
              <div className="w-full lg:w-[400px]">
                <Skeleton className="h-96 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet><title>Cart Error - OxgenieEdge</title></Helmet>
        <Header />
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-gray-50">
          <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Oops! Something went wrong</h2>
          <p className="text-gray-500 mb-8 text-center max-w-md">{error}</p>
          <button
            onClick={fetchCartItems}
            className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 shadow-sm flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Try Again
          </button>
        </div>
        <Footer />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Helmet><title>Your Cart - OxgenieEdge</title></Helmet>
        <Header />
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-gray-50">
          <div className="w-24 h-24 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
          <p className="text-gray-500 mb-8 text-center max-w-md">
            Looks like you haven't added any services or products to your cart yet. Discover our premium digital solutions.
          </p>
          <div className="flex gap-4">
            <Link
              to="/services"
              className="px-8 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-all duration-200 shadow-sm"
            >
              Explore Services
            </Link>
            <Link
              to="/products"
              className="px-8 py-3 bg-white text-gray-900 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 shadow-sm"
            >
              View Products
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet><title>Shopping Cart - OxgenieEdge</title></Helmet>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <span className="text-gray-500 font-medium">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-8">
              
              {/* Cart Items */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="hidden sm:grid grid-cols-12 gap-4 p-6 border-b border-gray-100 bg-gray-50/50 text-sm font-medium text-gray-500 uppercase tracking-wider">
                  <div className="col-span-6">Service/Product</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <div key={item.id} className={`p-6 flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center transition-opacity ${processingId === item.id ? 'opacity-50 pointer-events-none' : ''}`}>
                      <div className="col-span-6 flex items-start w-full">
                        <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0 mr-4 mt-1">
                          <span className="text-accent font-bold text-lg">{item.productName.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 text-lg leading-tight">{item.productName}</h3>
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-gray-100 text-gray-600">
                              {item.productType}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-1">{item.notes || 'Premium subscription'}</p>
                          <button 
                            onClick={() => handleDeleteItem(item.id)}
                            disabled={processingId === item.id}
                            className="text-sm text-red-500 hover:text-red-700 flex items-center mt-3 font-medium transition-colors disabled:opacity-50"
                          >
                            {processingId === item.id ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1" />}
                            Remove
                          </button>
                        </div>
                      </div>
                      
                      <div className="col-span-2 text-center w-full sm:w-auto flex justify-between sm:block">
                        <span className="sm:hidden text-gray-500 text-sm">Price:</span>
                        <span className="font-medium text-gray-900">₹{item.price.toLocaleString()}</span>
                      </div>
                      
                      <div className="col-span-2 flex justify-center w-full sm:w-auto">
                        <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50/50 p-1">
                          <button 
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, item.price, -1)}
                            disabled={item.quantity <= 1 || processingId === item.id}
                            className="p-1.5 text-gray-500 hover:text-accent bg-white rounded-md shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-10 text-center font-medium text-gray-900">{item.quantity}</span>
                          <button 
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, item.price, 1)}
                            disabled={processingId === item.id}
                            className="p-1.5 text-gray-500 hover:text-accent bg-white rounded-md shadow-sm transition-colors disabled:opacity-50"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="col-span-2 text-right w-full sm:w-auto flex justify-between sm:block">
                        <span className="sm:hidden text-gray-500 text-sm">Subtotal:</span>
                        <span className="font-bold text-gray-900">₹{item.totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="w-full lg:w-[400px]">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sticky top-28">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-900">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Estimated Tax (18% GST)</span>
                    <span className="font-medium text-gray-900">₹{tax.toLocaleString()}</span>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <CouponInput />
                  </div>
                  
                  <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">Total</span>
                    <div className="text-right">
                      <span className="text-3xl font-extrabold text-accent">₹{total.toLocaleString()}</span>
                      <p className="text-xs text-gray-400 mt-1">Includes all taxes</p>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full py-4 bg-accent text-white rounded-xl font-semibold hover:bg-accent/90 transition-all duration-200 active:scale-[0.98] flex items-center justify-center space-x-2 mb-4 shadow-md shadow-accent/20"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                
                <Link 
                  to="/products"
                  className="block text-center text-sm font-medium text-gray-500 hover:text-accent transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CartPage;