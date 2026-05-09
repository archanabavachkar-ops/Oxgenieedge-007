import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import FormInput from '@/components/form/FormInput.jsx';
import PasswordInput from '@/components/PasswordInput.jsx';
import { Button } from '@/components/ui/button.jsx';

import apiServerClient from '@/lib/apiServerClient.js';

const formSchema = z.object({
  identifier: z.string().min(2, "Email or Username is required"),
  password: z.string().min(1, "Password is required")
});

export default function PartnerLoginPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting, isValid } } = useForm({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      identifier: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const isEmail = data.identifier.includes('@');
      const payload = {
        password: data.password,
        ...(isEmail ? { email: data.identifier } : { username: data.identifier })
      };

      const response = await apiServerClient.fetch('/partners/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Invalid email/username or password');
      }

      if (result.token) {
        localStorage.setItem('partnerToken', result.token);
        localStorage.setItem('partnerUser', JSON.stringify({
          id: result.partnerId,
          name: result.partnerName
        }));
      }

      toast.success('Successfully logged in');
      navigate('/partners/dashboard');
    } catch (err) {
      console.error(err);
      const errorMsg = 'Invalid email/username or password';
      setServerError(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1F2937] text-white">
      <Helmet><title>Partner Login | OxgenieEdge</title></Helmet>
      <Header />
      
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full space-y-8 bg-[#111827] border border-gray-800 p-8 sm:p-10 rounded-2xl shadow-2xl"
        >
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back, Partner</h1>
            <p className="mt-2 text-sm text-[#9CA3AF]">
              Sign in to your partner dashboard
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
            {serverError && (
              <div className="bg-[#EF4444]/10 border border-[#EF4444]/50 text-[#EF4444] text-sm rounded-md p-3 text-center">
                {serverError}
              </div>
            )}

            <div className="space-y-5">
              <FormInput
                label="Email or Username"
                required
                {...register('identifier')}
                error={errors.identifier?.message}
                placeholder="partner@company.com"
              />

              <PasswordInput
                label="Password"
                required
                {...register('password')}
                error={errors.password?.message}
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-end">
              <div className="text-sm">
                <Link to="/partners/forgot-password" className="font-medium text-[#F97316] hover:text-[#FDBA74] transition-colors">
                  Forgot your password?
                </Link>
              </div>
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
                  'Login'
                )}
              </Button>
            </div>
            
            <div className="text-center mt-6">
              <p className="text-sm text-[#9CA3AF]">
                Don't have an account?{' '}
                <Link to="/partners/signup" className="font-medium text-[#F97316] hover:text-[#FDBA74] underline transition-colors">
                  Sign up here
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}