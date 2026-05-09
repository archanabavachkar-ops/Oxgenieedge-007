import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import PasswordInput from '@/components/PasswordInput.jsx';
import { Button } from '@/components/ui/button.jsx';

import apiServerClient from '@/lib/apiServerClient.js';

const formSchema = z.object({
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function PartnerResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [serverError, setServerError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting, isValid } } = useForm({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      newPassword: '',
      confirmPassword: ''
    }
  });

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValidToken(false);
        setIsValidating(false);
        return;
      }

      try {
        const response = await apiServerClient.fetch(`/partners/validate-reset-token/${token}`);
        const data = await response.json();
        
        if (response.ok && data.valid) {
          setIsValidToken(true);
        } else {
          setIsValidToken(false);
        }
      } catch (err) {
        console.error("Token validation error:", err);
        setIsValidToken(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const response = await apiServerClient.fetch('/partners/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token, 
          newPassword: data.newPassword 
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to reset password');
      }

      setResetSuccess(true);
      toast.success('Password reset successfully!');
      
      setTimeout(() => {
        navigate('/partners/login');
      }, 2000);

    } catch (err) {
      console.error(err);
      const errorMsg = err.message || 'An error occurred during password reset';
      setServerError(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1F2937] text-white">
      <Helmet><title>Reset Password | OxgenieEdge Partners</title></Helmet>
      <Header />
      
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full space-y-8 bg-[#111827] border border-gray-800 p-8 sm:p-10 rounded-2xl shadow-2xl"
        >
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Create New Password</h1>
            <p className="mt-2 text-sm text-[#9CA3AF]">
              Enter your new password below.
            </p>
          </div>

          {isValidating ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-[#F97316]" />
              <p className="text-[#9CA3AF]">Validating secure link...</p>
            </div>
          ) : !isValidToken ? (
            <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl p-6 text-center mt-6">
              <AlertCircle className="w-12 h-12 text-[#EF4444] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Invalid or Expired Link</h3>
              <p className="text-sm text-[#9CA3AF] mb-6">
                This reset link has expired or is invalid. Please request a new one.
              </p>
              <Link to="/partners/forgot-password" className="inline-flex items-center justify-center px-4 py-2 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-md font-bold transition-colors w-full">
                Request New Link
              </Link>
            </div>
          ) : resetSuccess ? (
            <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl p-6 text-center mt-6">
              <CheckCircle2 className="w-12 h-12 text-[#10B981] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Password Reset Successful</h3>
              <p className="text-sm text-[#9CA3AF] mb-6">
                Your password has been updated. Redirecting to login...
              </p>
              <Link to="/partners/login" className="inline-flex items-center justify-center px-4 py-2 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-md font-bold transition-colors w-full">
                Go to Login Now
              </Link>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
              {serverError && (
                <div className="bg-[#EF4444]/10 border border-[#EF4444]/50 text-[#EF4444] text-sm rounded-md p-3 text-center">
                  {serverError}
                </div>
              )}

              <div className="space-y-5">
                <PasswordInput
                  label="New Password"
                  required
                  {...register('newPassword')}
                  error={errors.newPassword?.message}
                  placeholder="••••••••"
                />

                <PasswordInput
                  label="Confirm New Password"
                  required
                  {...register('confirmPassword')}
                  error={errors.confirmPassword?.message}
                  placeholder="••••••••"
                />
              </div>

              <div>
                <Button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className="w-full flex justify-center py-6 px-4 border border-transparent rounded-md shadow-sm text-lg font-bold text-white bg-[#F97316] hover:bg-[#EA580C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F97316] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </div>
            </form>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}