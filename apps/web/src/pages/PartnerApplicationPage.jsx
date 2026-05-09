import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Loader2, UploadCloud, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import apiServerClient from '@/lib/apiServerClient.js';
import { Link } from 'react-router-dom';

const REGIONS = {
  'North America': ['USA', 'Canada', 'Mexico'],
  'South America': ['Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru'],
  'Europe': ['UK', 'Germany', 'France', 'Spain', 'Italy', 'Netherlands', 'Poland', 'Sweden'],
  'Asia': ['India', 'China', 'Japan', 'Singapore', 'Australia', 'Thailand', 'Vietnam', 'Philippines'],
  'Africa': ['South Africa', 'Nigeria', 'Kenya', 'Egypt', 'Morocco'],
  'Oceania': ['Australia', 'New Zealand', 'Fiji']
};

const SERVICES = [
  'Web Development', 'Mobile App Development', 'UI/UX Design', 
  'Digital Marketing', 'Cloud Solutions', 'Cybersecurity', 
  'Data Analytics', 'AI/Machine Learning', 'E-commerce Solutions', 'Consulting'
];

export default function PartnerApplicationPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  
  const { register, handleSubmit, watch, control, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      servicesOffered: [],
      region: '',
      country: ''
    }
  });

  const selectedRegion = watch('region');
  const selectedServices = watch('servicesOffered');
  const motivationText = watch('whyPartner') || '';

  const [files, setFiles] = useState({
    gstCertificate: null,
    panCertificate: null,
    certifications: [],
    portfolio: []
  });

  const handleSingleFile = (e, fieldName, maxSizeMB) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File must be smaller than ${maxSizeMB}MB`);
      return;
    }
    setFiles(prev => ({ ...prev, [fieldName]: file }));
    e.target.value = null; // reset input
  };

  const handleMultipleFiles = (e, fieldName, maxSizeMB) => {
    const selected = Array.from(e.target.files);
    const validFiles = selected.filter(f => f.size <= maxSizeMB * 1024 * 1024);
    if (validFiles.length < selected.length) {
      toast.error(`Some files were skipped because they exceed ${maxSizeMB}MB`);
    }
    setFiles(prev => ({ ...prev, [fieldName]: [...prev[fieldName], ...validFiles] }));
    e.target.value = null; // reset input
  };

  const removeFile = (fieldName, index = null) => {
    setFiles(prev => {
      if (index === null) return { ...prev, [fieldName]: null };
      const newArr = [...prev[fieldName]];
      newArr.splice(index, 1);
      return { ...prev, [fieldName]: newArr };
    });
  };

  const onSubmit = async (data) => {
    try {
      if (data.servicesOffered.length === 0) {
        toast.error('Please select at least one service.');
        return;
      }

      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'servicesOffered') {
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, data[key]);
        }
      });

      // Append files
      if (files.gstCertificate) formData.append('gstCertificate', files.gstCertificate);
      if (files.panCertificate) formData.append('panCertificate', files.panCertificate);
      files.certifications.forEach(f => formData.append('certifications', f));
      files.portfolio.forEach(f => formData.append('portfolio', f));

      const response = await apiServerClient.fetch('/partner-applications/submit', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to submit application');
      }

      setApplicationId(result.applicationId);
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'An error occurred during submission.');
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col">
        <Helmet><title>Application Submitted | OxgenieEdge</title></Helmet>
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card max-w-lg w-full p-10 rounded-2xl border border-border shadow-xl text-center"
          >
            <div className="w-20 h-20 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Application Submitted!</h1>
            <p className="text-muted-foreground mb-6 text-lg">
              Thank you for applying. We have received your application and will review it shortly.
            </p>
            <div className="bg-input rounded-xl p-6 mb-8 border border-border/50">
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Your Application ID</p>
              <p className="text-xl font-bold font-mono text-primary">{applicationId}</p>
            </div>
            <Link to="/" className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-[#EA580C] transition-colors w-full">
              Return to Home
            </Link>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet><title>Partner Application | OxgenieEdge</title></Helmet>
      <Header />
      
      <main className="flex-grow py-12 md:py-20 px-4 sm:px-6">
        <div className="max-w-[600px] mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Become a Partner</h1>
            <p className="text-muted-foreground">Fill out the form below to apply for the OxgenieEdge partner programme.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-[30px]">
            
            {/* 1. BASIC DETAILS */}
            <section className="bg-card p-6 md:p-8 rounded-2xl border border-border/50 shadow-lg space-y-[15px]">
              <h2 className="text-xl font-bold mb-2 text-primary">1. Basic Details</h2>
              
              <div>
                <label>Full Name <span className="text-destructive">*</span></label>
                <input 
                  type="text" 
                  {...register('fullName', { required: 'Full name is required', minLength: { value: 2, message: 'Minimum 2 characters' } })} 
                  className={errors.fullName ? '!border-destructive' : ''}
                  placeholder="John Doe"
                />
                {errors.fullName && <p className="text-destructive text-sm mt-1">{errors.fullName.message}</p>}
              </div>

              <div>
                <label>Company Name <span className="text-destructive">*</span></label>
                <input 
                  type="text" 
                  {...register('companyName', { required: 'Company name is required', minLength: { value: 2, message: 'Minimum 2 characters' } })} 
                  className={errors.companyName ? '!border-destructive' : ''}
                  placeholder="Acme Corp"
                />
                {errors.companyName && <p className="text-destructive text-sm mt-1">{errors.companyName.message}</p>}
              </div>

              <div>
                <label>Email Address <span className="text-destructive">*</span></label>
                <input 
                  type="email" 
                  {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format' } })} 
                  className={errors.email ? '!border-destructive' : ''}
                  placeholder="john@example.com"
                />
                {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label>Mobile Number <span className="text-destructive">*</span></label>
                <input 
                  type="tel" 
                  {...register('mobileNumber', { required: 'Mobile number is required', pattern: { value: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im, message: 'Invalid phone format' } })} 
                  className={errors.mobileNumber ? '!border-destructive' : ''}
                  placeholder="+1 234 567 8900"
                />
                {errors.mobileNumber && <p className="text-destructive text-sm mt-1">{errors.mobileNumber.message}</p>}
              </div>

              <div>
                <label>Website / Portfolio URL</label>
                <input 
                  type="url" 
                  {...register('website', { pattern: { value: /^https?:\/\/.*/, message: 'Must start with http:// or https://' } })} 
                  className={errors.website ? '!border-destructive' : ''}
                  placeholder="https://example.com"
                />
                {errors.website && <p className="text-destructive text-sm mt-1">{errors.website.message}</p>}
              </div>
            </section>

            {/* 2. BUSINESS INFORMATION */}
            <section className="bg-card p-6 md:p-8 rounded-2xl border border-border/50 shadow-lg space-y-[15px]">
              <h2 className="text-xl font-bold mb-2 text-primary">2. Business Information</h2>
              
              <div>
                <label>Business Type <span className="text-destructive">*</span></label>
                <select 
                  {...register('businessType', { required: 'Select a business type' })}
                  className={errors.businessType ? '!border-destructive' : ''}
                >
                  <option value="">Select type...</option>
                  <option value="Agency">Agency</option>
                  <option value="Freelancer">Freelancer</option>
                  <option value="Reseller">Reseller</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
                {errors.businessType && <p className="text-destructive text-sm mt-1">{errors.businessType.message}</p>}
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="!mb-0">Services Offered <span className="text-destructive">*</span></label>
                  <span className="text-xs text-muted-foreground font-medium">Selected: {selectedServices.length}/10</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SERVICES.map(service => (
                    <label key={service} className="flex items-center gap-3 p-3 bg-input rounded-lg border border-transparent cursor-pointer hover:border-border transition-colors font-normal text-sm">
                      <input 
                        type="checkbox" 
                        value={service}
                        {...register('servicesOffered')}
                        className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-ring"
                      />
                      {service}
                    </label>
                  ))}
                </div>
              </div>
            </section>

            {/* 3. GEOGRAPHY */}
            <section className="bg-card p-6 md:p-8 rounded-2xl border border-border/50 shadow-lg space-y-[15px]">
              <h2 className="text-xl font-bold mb-2 text-primary">3. Geography</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[15px]">
                <div>
                  <label>Region <span className="text-destructive">*</span></label>
                  <select 
                    {...register('region', { required: 'Select a region' })}
                    className={errors.region ? '!border-destructive' : ''}
                  >
                    <option value="">Select region...</option>
                    {Object.keys(REGIONS).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  {errors.region && <p className="text-destructive text-sm mt-1">{errors.region.message}</p>}
                </div>

                <div>
                  <label>Country <span className="text-destructive">*</span></label>
                  <select 
                    {...register('country', { required: 'Select a country' })}
                    disabled={!selectedRegion}
                    className={errors.country ? '!border-destructive' : ''}
                  >
                    <option value="">Select country...</option>
                    {selectedRegion && REGIONS[selectedRegion].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.country && <p className="text-destructive text-sm mt-1">{errors.country.message}</p>}
                </div>
              </div>
            </section>

            {/* 4. MOTIVATION */}
            <section className="bg-card p-6 md:p-8 rounded-2xl border border-border/50 shadow-lg space-y-[15px]">
              <h2 className="text-xl font-bold mb-2 text-primary">4. Motivation</h2>
              
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="!mb-0">Why do you want to partner? <span className="text-destructive">*</span></label>
                  <span className={`text-xs font-medium ${motivationText.length > 500 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {motivationText.length}/500
                  </span>
                </div>
                <textarea 
                  {...register('whyPartner', { 
                    required: 'Motivation is required',
                    minLength: { value: 20, message: 'Minimum 20 characters' },
                    maxLength: { value: 500, message: 'Maximum 500 characters' }
                  })}
                  rows="4"
                  className={`resize-y ${errors.whyPartner ? '!border-destructive' : ''}`}
                  placeholder="Tell us about your business goals and partnership expectations..."
                ></textarea>
                {errors.whyPartner && <p className="text-destructive text-sm mt-1">{errors.whyPartner.message}</p>}
              </div>
            </section>

            {/* 5. DOCUMENT UPLOADS */}
            <section className="bg-card p-6 md:p-8 rounded-2xl border border-border/50 shadow-lg space-y-[20px]">
              <h2 className="text-xl font-bold mb-2 text-primary">5. Document Uploads <span className="text-sm font-normal text-muted-foreground">(Optional)</span></h2>
              
              {/* GST */}
              <div>
                <label>GST Certificate (Max 5MB)</label>
                {!files.gstCertificate ? (
                  <div className="relative border-2 border-dashed border-border/50 rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer bg-input">
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleSingleFile(e, 'gstCertificate', 5)} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <UploadCloud className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                    <span className="text-sm font-medium">Click to upload GST</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-input rounded-lg border border-border/30">
                    <span className="text-sm truncate mr-4">{files.gstCertificate.name}</span>
                    <button type="button" onClick={() => removeFile('gstCertificate')} className="text-destructive hover:bg-destructive/10 p-1 rounded"><X className="w-4 h-4"/></button>
                  </div>
                )}
              </div>

              {/* PAN */}
              <div>
                <label>PAN Certificate (Max 5MB)</label>
                {!files.panCertificate ? (
                  <div className="relative border-2 border-dashed border-border/50 rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer bg-input">
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleSingleFile(e, 'panCertificate', 5)} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <UploadCloud className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                    <span className="text-sm font-medium">Click to upload PAN</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-input rounded-lg border border-border/30">
                    <span className="text-sm truncate mr-4">{files.panCertificate.name}</span>
                    <button type="button" onClick={() => removeFile('panCertificate')} className="text-destructive hover:bg-destructive/10 p-1 rounded"><X className="w-4 h-4"/></button>
                  </div>
                )}
              </div>

              {/* Certifications */}
              <div>
                <label>Certifications (Max 5MB per file)</label>
                <div className="relative border-2 border-dashed border-border/50 rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer bg-input mb-3">
                  <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleMultipleFiles(e, 'certifications', 5)} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <UploadCloud className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <span className="text-sm font-medium">Click to add certifications</span>
                </div>
                {files.certifications.length > 0 && (
                  <div className="space-y-2">
                    {files.certifications.map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-2 px-3 bg-input rounded-lg border border-border/30">
                        <span className="text-sm truncate mr-4">{f.name}</span>
                        <button type="button" onClick={() => removeFile('certifications', i)} className="text-destructive hover:bg-destructive/10 p-1 rounded"><X className="w-4 h-4"/></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Portfolio */}
              <div>
                <label>Portfolio / Case Studies (Max 10MB per file)</label>
                <div className="relative border-2 border-dashed border-border/50 rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer bg-input mb-3">
                  <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.zip" onChange={(e) => handleMultipleFiles(e, 'portfolio', 10)} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <UploadCloud className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <span className="text-sm font-medium">Click to add portfolio files</span>
                </div>
                {files.portfolio.length > 0 && (
                  <div className="space-y-2">
                    {files.portfolio.map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-2 px-3 bg-input rounded-lg border border-border/30">
                        <span className="text-sm truncate mr-4">{f.name}</span>
                        <button type="button" onClick={() => removeFile('portfolio', i)} className="text-destructive hover:bg-destructive/10 p-1 rounded"><X className="w-4 h-4"/></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* 6 & 7. T&C and SUBMIT */}
            <section className="bg-card p-6 md:p-8 rounded-2xl border border-border/50 shadow-lg space-y-[20px]">
              
              <label className="flex items-start gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  {...register('termsAccepted', { required: 'You must accept the terms' })}
                  className="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-ring bg-input cursor-pointer"
                />
                <span className="text-sm text-foreground group-hover:text-primary transition-colors font-normal">
                  I agree to the <Link to="/terms" className="underline font-bold">Terms & Conditions</Link> and <Link to="/privacy" className="underline font-bold">Privacy Policy</Link>. <span className="text-destructive">*</span>
                </span>
              </label>
              {errors.termsAccepted && <p className="text-destructive text-sm mt-[-10px]">{errors.termsAccepted.message}</p>}

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:bg-[#EA580C] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            </section>

          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}