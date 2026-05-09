import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import apiServerClient from '@/lib/apiServerClient.js';

import FormInput from '@/components/form/FormInput.jsx';
import PasswordInput from '@/components/PasswordInput.jsx';
import FormTextarea from '@/components/form/FormTextarea.jsx';
import FormSelect from '@/components/form/FormSelect.jsx';
import FormCheckbox from '@/components/form/FormCheckbox.jsx';
import { Button } from '@/components/ui/button.jsx';

const BUSINESS_TYPES = [
  { label: 'Agency', value: 'Agency' },
  { label: 'Freelancer', value: 'Freelancer' },
  { label: 'Reseller', value: 'Reseller' },
  { label: 'Enterprise', value: 'Enterprise' }
];

const formSchema = z.object({
  firstName: z.string().min(2, "First Name must be at least 2 characters"),
  lastName: z.string().min(2, "Last Name must be at least 2 characters"),
  companyName: z.string().min(3, "Company Name must be at least 3 characters"),
  email: z.string().email("Invalid email address format"),
  mobileNumber: z.string().min(10, "Phone number is required").regex(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]*$/, "Invalid phone format"),
  website: z.union([z.string().url("Invalid URL format (must include http/https)"), z.string().length(0)]).optional(),
  businessType: z.string().min(1, "Select a Business Type"),
  businessDescription: z.string().max(500, "Maximum 500 characters allowed").optional(),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/[0-9]/, "Must contain number"),
  confirmPassword: z.string(),
  termsAccepted: z.boolean().refine(val => val === true, "You must agree to the Terms & Conditions")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function PartnerSignupPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  
  const { register, handleSubmit, watch, control, reset, formState: { errors, isSubmitting, isValid } } = useForm({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      companyName: '',
      email: '',
      mobileNumber: '',
      website: '',
      businessType: '',
      businessDescription: '',
      password: '',
      confirmPassword: '',
      termsAccepted: false
    }
  });

  const businessDescriptionValue = watch('businessDescription');

  const handleReset = () => {
    if (window.confirm('Are you sure you want to clear the form? All entered data will be lost.')) {
      reset();
    }
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        fullName: `${data.firstName} ${data.lastName}`,
        companyName: data.companyName,
        email: data.email,
        mobileNumber: data.mobileNumber,
        website: data.website,
        businessType: data.businessType,
        whyPartner: data.businessDescription || 'Partner signup',
        password: data.password,
        termsAccepted: data.termsAccepted,
        source: 'website',
        status: 'New',
        region: 'North America', // Defaulting for simplified form
        country: 'USA',
        servicesOffered: []
      };

      const response = await apiServerClient.fetch('/partner-applications/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to submit application');
      }

      setApplicationId(result.applicationId || result.id || 'N/A');
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'An error occurred during submission. Please try again.');
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-[#1F2937] text-white">
        <Helmet><title>Application Submitted | OxgenieEdge</title></Helmet>
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#374151] max-w-lg w-full p-10 rounded-2xl border border-[#FDBA74] shadow-xl text-center"
          >
            <div className="w-20 h-20 bg-[#F97316]/20 text-[#F97316] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-white">Application submitted successfully!</h1>
            <p className="text-[#9CA3AF] mb-6 text-lg">
              We'll review your application and contact you soon.
            </p>
            <div className="bg-[#1F2937] rounded-xl p-6 mb-8 border border-[#FDBA74]/50">
              <p className="text-sm text-[#9CA3AF] uppercase tracking-wider mb-2 font-bold">Your Application ID</p>
              <p className="text-xl font-bold font-mono text-[#F97316]">{applicationId}</p>
            </div>
            <Link to="/" className="inline-flex items-center justify-center px-6 py-3 bg-[#F97316] text-white hover:bg-[#EA580C] rounded-lg font-bold transition-colors w-full">
              Return to Home
            </Link>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#1F2937] text-white">
      <Helmet><title>Partner Application | OxgenieEdge</title></Helmet>
      <Header />
      
      <main className="flex-grow py-10 px-5 md:py-10 md:px-10">
        <div className="max-w-[600px] mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">Partner Application Form</h1>
            <p className="text-[#9CA3AF]">Join our partner network and grow your business with OxgenieEdge.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
            
            <section className="space-y-6 bg-[#111827] p-6 rounded-2xl border border-gray-800">
              <h2 className="text-xl font-bold text-[#F97316] border-b border-gray-800 pb-2">Personal Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput 
                  label="First Name"
                  required
                  {...register('firstName')}
                  error={errors.firstName?.message}
                  placeholder="John"
                />
                <FormInput 
                  label="Last Name"
                  required
                  {...register('lastName')}
                  error={errors.lastName?.message}
                  placeholder="Doe"
                />
              </div>

              <FormInput 
                label="Email Address"
                type="email"
                required
                {...register('email')}
                error={errors.email?.message}
                placeholder="john@example.com"
              />

              <FormInput 
                label="Phone Number"
                type="tel"
                required
                {...register('mobileNumber')}
                error={errors.mobileNumber?.message}
                placeholder="+1 (555) 000-0000"
              />
            </section>

            <section className="space-y-6 bg-[#111827] p-6 rounded-2xl border border-gray-800">
              <h2 className="text-xl font-bold text-[#F97316] border-b border-gray-800 pb-2">Business Information</h2>
              
              <FormInput 
                label="Company Name"
                required
                {...register('companyName')}
                error={errors.companyName?.message}
                placeholder="Acme Corp"
              />

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
                placeholder="https://example.com"
              />

              <FormTextarea
                label="Business Description"
                maxLength={500}
                {...register('businessDescription')}
                value={businessDescriptionValue}
                error={errors.businessDescription?.message}
                placeholder="Tell us about your business..."
              />
            </section>

            <section className="space-y-6 bg-[#111827] p-6 rounded-2xl border border-gray-800">
              <h2 className="text-xl font-bold text-[#F97316] border-b border-gray-800 pb-2">Account Security</h2>
              
              <PasswordInput
                label="Password"
                required
                {...register('password')}
                error={errors.password?.message}
                placeholder="Create a strong password"
              />

              <PasswordInput
                label="Confirm Password"
                required
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
                placeholder="Confirm your password"
              />
            </section>

            <section className="pt-2">
              <Controller
                control={control}
                name="termsAccepted"
                render={({ field }) => (
                  <FormCheckbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    error={errors.termsAccepted?.message}
                    required
                  >
                    I agree to the <Link to="/terms" className="text-[#FDBA74] hover:text-[#F97316] underline">Terms & Conditions</Link> and <Link to="/privacy" className="text-[#FDBA74] hover:text-[#F97316] underline">Privacy Policy</Link>
                  </FormCheckbox>
                )}
              />
            </section>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting || !isValid}
                className="w-full sm:flex-1 py-6 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-lg rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={handleReset}
                disabled={isSubmitting}
                className="w-full sm:w-auto py-6 bg-[#374151] border-transparent hover:bg-[#4B5563] text-white font-bold text-lg rounded-md transition-all"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Reset
              </Button>
            </div>
            
            <div className="border-t border-gray-800 pt-6 flex flex-col gap-3 text-center text-sm">
              <p className="text-[#9CA3AF]">
                Already have an account?{' '}
                <Link to="/partners/login" className="text-[#F97316] hover:text-[#FDBA74] font-medium underline transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>

          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}