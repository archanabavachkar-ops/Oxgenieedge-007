import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import FormInput from '@/components/form/FormInput.jsx';
import { Button } from '@/components/ui/button.jsx';

import apiServerClient from '@/lib/apiServerClient.js';

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

export default function PartnerForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting, isValid } } = useForm({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      const response = await apiServerClient.fetch('/partners/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email })
      });

      if (!response.ok) {
        throw new Error('Failed to process request');
      }

      setIsSuccess(true);
      toast.success('Password reset link sent to your email. Check your inbox.');
    } catch (err) {
      console.error(err);
      toast.error('If an account exists with this email, you will receive a password reset link');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1F2937] text-white">
      <Helmet><title>Forgot Password | OxgenieEdge Partners</title></Helmet>
      <Header />
      
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full space-y-8 bg-[#111827] border border-gray-800 p-8 sm:p-10 rounded-2xl shadow-2xl"
        >
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Reset Your Password</h1>
            <p className="mt-2 text-sm text-[#9CA3AF]">
              Enter your email address and we'll send you a password reset link.
            </p>
          </div>

          {isSuccess ? (
            <div className="mt-8 bg-[#1F2937] rounded-xl p-6 border border-gray-800 text-center">
              <div className="text-[#10B981] mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Check your email</h3>
              <p className="text-sm text-[#9CA3AF] mb-6">
                If an account exists with that email, we've sent instructions to reset your password.
              </p>
              <Link to="/partners/login" className="inline-flex items-center justify-center px-4 py-2 bg-[#374151] border border-transparent text-white hover:bg-[#4B5563] rounded-md font-medium transition-colors w-full">
                Return to Login
              </Link>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
              <FormInput
                label="Email Address"
                type="email"
                required
                {...register('email')}
                error={errors.email?.message}
                placeholder="partner@company.com"
              />

              <div>
                <Button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className="w-full flex justify-center py-6 px-4 border border-transparent rounded-md shadow-sm text-lg font-bold text-white bg-[#F97316] hover:bg-[#EA580C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F97316] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4 text-sm">
                <Link to="/partners/login" className="flex items-center text-[#9CA3AF] hover:text-white transition-colors">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back to login
                </Link>
                <Link to="/partners/signup" className="font-medium text-[#F97316] hover:text-[#FDBA74] underline transition-colors">
                  Create new account
                </Link>
              </div>
            </form>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}