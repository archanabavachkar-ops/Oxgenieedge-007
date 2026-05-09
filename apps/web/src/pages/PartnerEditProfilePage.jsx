import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, ArrowLeft, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import apiServerClient from '@/lib/apiServerClient.js';

import FormInput from '@/components/form/FormInput.jsx';
import FormSelect from '@/components/form/FormSelect.jsx';
import SkeletonLoader from '@/components/SkeletonLoader.jsx';
import { Button } from '@/components/ui/button.jsx';

const BUSINESS_TYPES = [
  { label: 'Agency', value: 'Agency' },
  { label: 'Freelancer', value: 'Freelancer' },
  { label: 'Reseller', value: 'Reseller' },
  { label: 'Enterprise', value: 'Enterprise' }
];

const profileSchema = z.object({
  partnerName: z.string().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters"),
  email: z.string().email("Invalid email format"),
  phone: z.string().optional(),
  companyName: z.string().min(3, "Company name must be at least 3 characters").max(100),
  businessType: z.string().min(1, "Please select a business type"),
  website: z.union([z.string().url("Invalid website URL"), z.string().length(0)]).optional(),
  address: z.string().max(100).optional(),
  city: z.string().max(50).optional(),
  state: z.string().max(50).optional(),
  country: z.string().optional(),
  postalCode: z.string().max(20).optional()
});

export default function PartnerEditProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { register, handleSubmit, setValue, control, reset, formState: { errors, isSubmitting, isValid } } = useForm({
    resolver: zodResolver(profileSchema),
    mode: 'onChange'
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('partnerToken');
        if (!token) throw new Error('Not authenticated');

        const res = await apiServerClient.fetch('/partners/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to load profile');
        }

        const p = data.partner;
        setValue('partnerName', p.name || '');
        setValue('email', p.email || '');
        setValue('phone', p.phone || '');
        setValue('companyName', p.company || '');
        setValue('businessType', p.businessType || '');
        setValue('website', p.website || '');
        setValue('address', p.address || '');
        setValue('city', p.city || '');
        setValue('state', p.state || '');
        setValue('country', p.country || '');
        setValue('postalCode', p.postalCode || '');

      } catch (err) {
        console.error(err);
        setError(err.message);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [setValue]);

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset changes?')) {
      reset();
    }
  };

  const onSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('partnerToken');
      const payload = {
        name: formData.partnerName,
        company: formData.companyName,
        ...formData
      };

      const res = await apiServerClient.fetch('/partners/me', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update profile');
      }

      toast.success('Profile updated successfully');
      setTimeout(() => navigate('/partners/dashboard'), 1000);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'An error occurred while saving');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1F2937]">
      <Helmet><title>Edit Profile | OxgenieEdge</title></Helmet>
      <Header />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
        <div className="max-w-[600px] w-full">
          
          <Button 
            variant="ghost" 
            onClick={() => navigate('/partners/dashboard')}
            className="text-gray-400 hover:text-white hover:bg-white/5 px-0 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight">Update Your Profile</h1>
            <p className="text-gray-400 mt-2">Manage your professional information and business details.</p>
          </div>

          {error && !loading ? (
            <div className="bg-[#EF4444]/10 border border-[#EF4444]/50 rounded-xl p-6 text-center text-white mb-8">
              <p className="text-red-400">{error}</p>
            </div>
          ) : null}

          <div className="bg-[#111827] rounded-2xl p-6 md:p-8 border border-gray-800 shadow-xl">
            {loading ? (
              <div className="space-y-6">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i}>
                    <SkeletonLoader height="16px" width="100px" className="mb-2" />
                    <SkeletonLoader height="48px" width="100%" />
                  </div>
                ))}
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    label="Partner Name"
                    required
                    {...register('partnerName')}
                    error={errors.partnerName?.message}
                  />
                  
                  <FormInput
                    label="Email Address"
                    required
                    readOnly
                    disabled
                    {...register('email')}
                    error={errors.email?.message}
                    helperText="Email cannot be changed."
                    className="opacity-50 cursor-not-allowed"
                  />

                  <FormInput
                    label="Company Name"
                    required
                    {...register('companyName')}
                    error={errors.companyName?.message}
                  />

                  <FormInput
                    label="Phone Number"
                    type="tel"
                    {...register('phone')}
                    error={errors.phone?.message}
                  />
                </div>

                <Controller
                  control={control}
                  name="businessType"
                  render={({ field }) => (
                    <FormSelect
                      label="Business Type"
                      required
                      options={BUSINESS_TYPES}
                      value={field.value}
                      onValueChange={field.onChange}
                      error={errors.businessType?.message}
                    />
                  )}
                />

                <FormInput
                  label="Website"
                  type="url"
                  {...register('website')}
                  error={errors.website?.message}
                />

                <div className="border-t border-gray-800 pt-6 mt-6">
                  <h3 className="text-lg font-medium text-white mb-4">Location Details</h3>
                  <div className="space-y-6">
                    <FormInput
                      label="Address"
                      {...register('address')}
                      error={errors.address?.message}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormInput
                        label="City"
                        {...register('city')}
                        error={errors.city?.message}
                      />
                      <FormInput
                        label="State / Province"
                        {...register('state')}
                        error={errors.state?.message}
                      />
                      <FormInput
                        label="Country"
                        {...register('country')}
                        error={errors.country?.message}
                      />
                      <FormInput
                        label="Postal Code"
                        {...register('postalCode')}
                        error={errors.postalCode?.message}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !isValid}
                    className="w-full sm:flex-1 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold h-12 disabled:opacity-50"
                  >
                    {isSubmitting && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                    Save Changes
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleReset}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-[#374151] border-transparent text-white hover:bg-[#4B5563] h-12"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>

              </form>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}