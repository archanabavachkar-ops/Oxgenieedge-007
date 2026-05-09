import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { CheckCircle2, ArrowRight, ShoppingBag, Home } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/hooks/useCart.jsx';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCart();

  useEffect(() => {
    // Clear cart on successful payment
    clearCart();
  }, [clearCart]);

  return (
    <>
      <Helmet>
        <title>Order Successful - OxgenieEdge</title>
        <meta name="description" content="Your order has been placed successfully." />
      </Helmet>
      <Header />
      <div className="min-h-screen bg-gray-50 py-20 px-4 sm:px-6 flex items-center justify-center">
        <Card className="max-w-lg w-full shadow-xl border-gray-100 text-center">
          <CardHeader className="pb-2">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 pb-8">
            <p className="text-gray-600 text-lg mb-6">
              Thank you for your purchase. Your order has been confirmed and is now being processed.
            </p>
            
            {sessionId && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6">
                <p className="text-sm text-gray-500 mb-1">Order Reference</p>
                <p className="font-mono font-medium text-gray-900 break-all">{sessionId}</p>
              </div>
            )}
            
            <p className="text-sm text-gray-500">
              We've sent a confirmation email with your order details and receipt.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center border-t border-gray-100 pt-6">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Return Home
              </Link>
            </Button>
            <Button asChild className="w-full sm:w-auto bg-accent hover:bg-accent/90">
              <Link to="/products">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      <Footer />
    </>
  );
};

export default PaymentSuccessPage;