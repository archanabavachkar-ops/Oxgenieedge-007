import React, { useState } from 'react';
import apiServerClient from '@/lib/apiServerClient';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import { Tag, X } from 'lucide-react';

const CouponInput = () => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { subtotal, applyDiscount, couponCode } = useCart();

  const handleApply = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsLoading(true);
    try {
      const response = await apiServerClient.fetch('/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode: code, orderTotal: subtotal })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Invalid coupon');
      }

      const data = await response.json();
      if (data.valid) {
        applyDiscount(data.discountAmount, data.couponCode);
        toast({ title: "Coupon Applied", description: `Saved ₹${data.discountAmount}` });
        setCode('');
      }
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    applyDiscount(0, null);
    toast({ title: "Coupon Removed" });
  };

  if (couponCode) {
    return (
      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center space-x-2 text-green-700">
          <Tag className="w-4 h-4" />
          <span className="font-medium text-sm">Code applied: {couponCode}</span>
        </div>
        <button onClick={handleRemove} className="text-green-700 hover:text-green-900">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleApply} className="flex space-x-2">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="Enter coupon code"
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-gray-900"
      />
      <button
        type="submit"
        disabled={isLoading || !code.trim()}
        className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
      >
        {isLoading ? 'Applying...' : 'Apply'}
      </button>
    </form>
  );
};

export default CouponInput;