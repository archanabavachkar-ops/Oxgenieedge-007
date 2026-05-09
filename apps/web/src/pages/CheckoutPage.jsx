import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ShieldCheck, Loader2, CreditCard, Lock } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import apiServerClient from '@/lib/apiServerClient';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const CheckoutPage = () => {
  const { items, subtotal, tax, discount, total, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: currentUser?.name || '',
    email: currentUser?.email || '',
    mobile: '',
    company: '',
    serviceRequirement: '',
    address: '',
    city: '',
    state: '',
    postalCode: ''
  });

  useEffect(() => {
    if (items.length === 0 && !isProcessing) {
      navigate('/cart');
    }
  }, [items, navigate, isProcessing]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!termsAccepted) {
      toast.error('Please accept the Terms & Conditions to proceed');
      return;
    }

    setIsProcessing(true);

    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Razorpay SDK failed to load. Are you offline?');
      }

      // 1. Create razorpay order via backend
      const orderRes = await apiServerClient.fetch('/razorpay/orders/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          customerId: currentUser?.id || 'guest',
          customerEmail: formData.email,
          customerName: formData.fullName,
          customerMobile: formData.mobile,
          customerCompany: formData.company,
          serviceRequirement: formData.serviceRequirement
        })
      });

      if (!orderRes.ok) throw new Error('Failed to initialize payment');
      const orderData = await orderRes.json();

      // 2. Open Razorpay Checkout modal
      const options = {
        key: 'rzp_test_placeholder_key', // This should be replaced in production
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'OxgenieEdge',
        description: 'Payment for Services/Products',
        order_id: orderData.razorpayOrderId,
        handler: async function (response) {
          try {
            setIsProcessing(true); // Keep processing state while verifying
            
            // 3. Verify payment signature
            const verifyRes = await apiServerClient.fetch('/razorpay/orders/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              })
            });

            if (!verifyRes.ok) throw new Error('Payment verification failed');
            
            // 4. Create final Order & Lead in PocketBase
            const createOrderRes = await apiServerClient.fetch('/orders/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customerId: currentUser?.id || 'guest',
                customerName: formData.fullName,
                customerEmail: formData.email,
                customerMobile: formData.mobile,
                customerCompany: formData.company,
                serviceRequirement: formData.serviceRequirement,
                items: items,
                totalAmount: total,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id
              })
            });

            if (!createOrderRes.ok) throw new Error('Failed to create order record');
            
            const finalData = await createOrderRes.json();
            
            await clearCart();
            toast.success('Payment successful!');
            navigate(`/order-success?orderId=${finalData.orderId}`);
            
          } catch (err) {
            console.error(err);
            toast.error('Post-payment processing failed. Contact support.');
            setIsProcessing(false);
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.mobile
        },
        theme: {
          color: '#F97316'
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            toast.info('Payment cancelled');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response) {
        toast.error(response.error.description || 'Payment failed');
        setIsProcessing(false);
      });
      
      rzp.open();

    } catch (err) {
      console.error(err);
      toast.error(err.message || 'An error occurred during checkout');
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Helmet><title>Secure Checkout - OxgenieEdge</title></Helmet>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-8">
            <Lock className="w-6 h-6 text-gray-400 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Secure Checkout</h1>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Left Column: Form */}
            <div className="flex-1">
              <form id="checkout-form" onSubmit={handlePayment} className="space-y-8">
                
                {/* Contact Info */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Contact Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-gray-900 transition-colors" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                      <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-gray-900 transition-colors" placeholder="john@example.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number *</label>
                      <input required type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-gray-900 transition-colors" placeholder="+91 XXXXX XXXXX" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                      <input required type="text" name="company" value={formData.company} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-gray-900 transition-colors" placeholder="Acme Inc." />
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Project Requirements</h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Briefly describe your requirements or goals *</label>
                    <textarea required name="serviceRequirement" rows={4} value={formData.serviceRequirement} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-gray-900 transition-colors resize-none" placeholder="We need a CRM integration with..." />
                    <p className="mt-2 text-xs text-gray-500">This helps our team prepare the right setup and allocate resources efficiently.</p>
                  </div>
                </div>

                {/* Billing Address (Optional) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Billing Address <span className="text-gray-400 font-normal text-sm">(Optional)</span></h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                      <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent text-gray-900 transition-colors" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent text-gray-900 transition-colors" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                        <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent text-gray-900 transition-colors" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                        <input type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent text-gray-900 transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>

              </form>
            </div>
            
            {/* Right Column: Order Summary */}
            <div className="w-full lg:w-[420px]">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 sticky top-28">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6 pb-6 border-b border-gray-100 max-h-[300px] overflow-y-auto pr-2">
                  {items.map(item => (
                    <div key={item.serviceId} className="flex justify-between items-start">
                      <div className="pr-4">
                        <p className="font-medium text-gray-900 leading-tight">{item.name}</p>
                        <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-gray-900 whitespace-nowrap">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Tax (18% GST)</span>
                    <span>₹{tax.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600 text-sm font-medium">
                      <span>Discount</span>
                      <span>-₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-4 border-t border-gray-100">
                    <span>Total</span>
                    <span className="text-accent">₹{total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Payment Method</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center">
                    <div className="w-10 h-10 bg-white rounded shadow-sm flex items-center justify-center mr-3">
                      <CreditCard className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Razorpay Secure</p>
                      <p className="text-xs text-gray-500">Cards, UPI, NetBanking</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6 flex items-start">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    required 
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
                  />
                  <label htmlFor="terms" className="ml-3 text-sm text-gray-600 leading-relaxed">
                    I agree to the <a href="#" className="text-accent hover:underline">Terms & Conditions</a> and <a href="#" className="text-accent hover:underline">Privacy Policy</a>.
                  </label>
                </div>
                
                <button 
                  type="submit"
                  form="checkout-form"
                  disabled={isProcessing}
                  className="w-full py-4 bg-accent text-white rounded-xl font-bold hover:bg-accent/90 transition-all duration-200 active:scale-[0.98] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-accent/20"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 mr-2" />
                      Pay Now (₹{total.toLocaleString()})
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center">
                  <Lock className="w-3 h-3 mr-1" /> SSL Encrypted Connection
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CheckoutPage;