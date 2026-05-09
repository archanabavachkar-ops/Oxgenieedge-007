import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, ArrowLeft, Shield } from 'lucide-react';
import { toast } from 'sonner';

import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import apiServerClient from '@/lib/apiServerClient.js';

import PasswordInput from '@/components/PasswordInput.jsx';
import { Button } from '@/components/ui/button.jsx';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export default function PartnerChangePasswordPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isValid } } = useForm({
    resolver: zodResolver(passwordSchema),
    mode: 'onChange'
  });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const token = localStorage.getItem('partnerToken');
      const res = await apiServerClient.fetch('/partners/change-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        })
      });
      
      const result = await res.json();
      
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to change password');
      }

      toast.success('Password changed successfully');
      reset();
      setTimeout(() => navigate('/partners/dashboard'), 1000);
    } catch (err) {
      console.error(err);
      setServerError(err.message || 'An error occurred');
      toast.error(err.message || 'Failed to change password');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1F2937]">
      <Helmet><title>Change Password | OxgenieEdge</title></Helmet>
      <Header />

      <main className="flex-grow py-12 px-4 flex justify-center items-center">
        <div className="max-w-[500px] w-full">
          
          <Button 
            variant="ghost" 
            onClick={() => navigate('/partners/dashboard')}
            className="text-gray-400 hover:text-white hover:bg-white/5 px-0 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>

          <div className="mb-8 text-center">
            <div className="mx-auto w-12 h-12 bg-[#F97316]/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-[#F97316]" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Update Your Password</h1>
            <p className="text-gray-400 mt-2">Ensure your account uses a strong, secure password.</p>
          </div>

          <div className="bg-[#111827] rounded-2xl p-6 md:p-8 border border-gray-800 shadow-xl">
            {serverError && (
              <div className="bg-[#EF4444]/10 border border-[#EF4444]/50 rounded-xl p-4 text-center text-sm text-red-400 mb-6">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              
              <PasswordInput
                label="Current Password"
                required
                {...register('currentPassword')}
                error={errors.currentPassword?.message}
                placeholder="••••••••"
              />

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

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !isValid}
                  className="w-full sm:flex-1 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold h-12 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                  Change Password
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/partners/dashboard')}
                  disabled={isSubmitting}
                  className="w-full sm:flex-1 bg-[#374151] border-transparent text-white hover:bg-[#4B5563] h-12"
                >
                  Cancel
                </Button>
              </div>

            </form>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}