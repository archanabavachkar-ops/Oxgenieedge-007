import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { CheckCircle, Download, Share2, ArrowRight } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // In a real app, we'd fetch by ID. Since we mocked the ID in checkout, 
        // we'll try to fetch the latest order for the user or just show a success state.
        const records = await pb.collection('orders').getFullList({
          filter: `id = "${orderId}"`,
          $autoCancel: false
        });
        if (records.length > 0) {
          setOrder(records[0]);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (orderId) fetchOrder();
  }, [orderId]);

  return (
    <>
      <Helmet><title>Order Confirmed - OxgenieEdge</title></Helmet>
      <Header />
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-green-500 p-8 text-center text-white">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
              <p className="text-green-100">Thank you for your purchase. Your order has been confirmed.</p>
            </div>
            
            <div className="p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-6 mb-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Order ID</p>
                  <p className="font-semibold text-gray-900">{orderId || 'ORD-12345678'}</p>
                </div>
                <div className="mt-4 sm:mt-0 text-left sm:text-right">
                  <p className="text-sm text-gray-500 mb-1">Date</p>
                  <p className="font-semibold text-gray-900">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">What happens next?</h3>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-blue-800 text-sm leading-relaxed">
                  Our team will review your order and activate your services within 24 hours. You will receive an email with onboarding instructions shortly.
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 border-t border-gray-100">
                <Link 
                  to="/dashboard"
                  className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center"
                >
                  Access Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                <button className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center">
                  <Download className="w-4 h-4 mr-2" /> Download Invoice
                </button>
                <button className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center">
                  <Share2 className="w-4 h-4 mr-2" /> Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrderConfirmationPage;