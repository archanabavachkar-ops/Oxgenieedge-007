import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await pb.collection('users').requestPasswordReset(email, { $autoCancel: false });
      setSuccess(true);
      toast.success('Password reset link sent to your email');
    } catch (error) {
      console.error('Password reset error:', error);
      // We still show success to prevent email enumeration attacks
      setSuccess(true);
      toast.success('If an account exists, a reset link was sent.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Forgot Password - OxgenieEdge</title>
        <meta name="description" content="Reset your OxgenieEdge account password." />
      </Helmet>
      <Header />
      <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 flex items-center justify-center">
        <Card className="max-w-md w-full shadow-xl border-gray-100">
          <CardHeader className="text-center pb-6">
            <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="font-bold text-2xl">O</span>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Reset Password</CardTitle>
            <CardDescription className="text-base mt-2">
              Enter your email address and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center space-y-6">
                <div className="bg-green-50 text-green-800 p-4 rounded-xl flex flex-col items-center justify-center border border-green-100">
                  <CheckCircle2 className="w-10 h-10 text-green-500 mb-2" />
                  <p className="font-medium">Check your email</p>
                  <p className="text-sm text-green-700 mt-1">
                    We've sent password reset instructions to {email}
                  </p>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/login">Return to Login</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 py-6"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full py-6 text-base bg-accent hover:bg-accent/90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Sending Link...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>

                <div className="text-center">
                  <Link to="/login" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-accent transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
};

export default ForgotPasswordPage;