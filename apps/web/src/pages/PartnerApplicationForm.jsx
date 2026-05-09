import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { CheckCircle2, UploadCloud, AlertCircle, ArrowRight, Building2, Globe, Briefcase, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import apiServerClient from '@/lib/apiServerClient.js';

const REGION_COUNTRY_MAP = {
  'North America': ['United States', 'Canada', 'Mexico'],
  'Europe': ['United Kingdom', 'Germany', 'France', 'Spain', 'Italy', 'Netherlands', 'Other Europe'],
  'Asia': ['India', 'Singapore', 'Japan', 'China', 'UAE', 'Other Asia'],
  'South America': ['Brazil', 'Argentina', 'Colombia', 'Other South America'],
  'Africa': ['South Africa', 'Nigeria', 'Kenya', 'Other Africa'],
  'Oceania': ['Australia', 'New Zealand', 'Other Oceania']
};

export default function PartnerApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.error('Maximum 5 files allowed');
      e.target.value = '';
      return;
    }
    
    const oversized = files.find(f => f.size > 5 * 1024 * 1024);
    if (oversized) {
      toast.error('Each file must be less than 5MB');
      e.target.value = '';
      return;
    }

    setSelectedFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      const form = e.target;
      const formData = new FormData(form);

      // Handle multi-select checkboxes for services
      const services = [];
      form.querySelectorAll('input[name="services_interested"]:checked').forEach(checkbox => {
        services.push(checkbox.value);
      });
      
      if (services.length === 0) {
        toast.error('Please select at least one service you offer.');
        setIsSubmitting(false);
        return;
      }
      
      // The backend expects services_interested as a string or JSON. 
      // We'll send it as a JSON string to be safe, or comma separated.
      formData.set('services_interested', JSON.stringify(services));

      // Separate Name into First and Last for the API format
      const fullName = formData.get('full_name') || '';
      const nameParts = fullName.trim().split(' ');
      formData.set('first_name', nameParts[0]);
      formData.set('last_name', nameParts.slice(1).join(' ') || 'Partner');
      
      // Map frontend fields to backend expected fields
      formData.set('motivation', formData.get('why_partner'));
      formData.set('portfolio_website', formData.get('website_url'));

      const response = await apiServerClient.fetch('/partner-applications/submit', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to submit application');
      }

      setApplicationId(data.application_id || 'PENDING');
      setIsSuccess(true);
      toast.success('Application submitted successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error.message || 'An error occurred while submitting. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Helmet><title>Application Submitted | OxgenieEdge Partners</title></Helmet>
        <Header />
        <main className="flex-grow flex items-center justify-center p-4 py-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card max-w-2xl w-full p-8 md:p-12 rounded-3xl border border-accent shadow-2xl text-center"
          >
            <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-green-500/20">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h1 className="text-4xl font-extrabold text-foreground mb-4 tracking-tight">Application Received!</h1>
            <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
              Thank you for applying to the OxgenieEdge Partner Programme. Your application ID is <br/>
              <span className="inline-block mt-2 px-4 py-2 bg-primary/10 text-primary font-mono font-bold text-xl rounded-lg border border-primary/20">{applicationId}</span>
            </p>
            <div className="bg-muted/50 rounded-2xl p-8 mb-10 text-left border border-accent/20">
              <h3 className="font-bold text-foreground mb-4 text-lg">What happens next?</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 text-sm font-bold mt-0.5">1</div>
                  <p className="text-muted-foreground">Our AI system will perform an initial evaluation of your profile and portfolio.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 text-sm font-bold mt-0.5">2</div>
                  <p className="text-muted-foreground">A dedicated partnership manager will manually review your details and documents.</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 text-sm font-bold mt-0.5">3</div>
                  <p className="text-muted-foreground">You will receive an email update regarding your approval status within 24-48 hours.</p>
                </li>
              </ul>
            </div>
            <a href="/" className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:bg-primary/90 transition-all active:scale-[0.98] w-full sm:w-auto shadow-lg shadow-primary/20">
              Return to Homepage
            </a>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet><title>Become a Partner | OxgenieEdge</title></Helmet>
      <Header />
      
      <main className="flex-grow py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 tracking-tight"
            >
              Become an <span className="text-primary">OxgenieEdge</span> Partner
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Join our ecosystem of agencies, freelancers, and enterprises. Deliver premium AI-powered growth systems to your clients and earn recurring commissions.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-3xl p-6 md:p-12 border border-accent shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-primary"></div>
            
            <form onSubmit={handleSubmit} className="space-y-10">
              
              {/* Section 1: Personal Details */}
              <section>
                <div className="flex items-center gap-3 mb-6 border-b border-accent/20 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">1. Applicant Details</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Full Name <span className="text-primary">*</span></label>
                    <input 
                      type="text" 
                      name="full_name" 
                      required 
                      className="w-full bg-muted border border-accent/50 rounded-xl px-4 py-3.5 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Company Name</label>
                    <input 
                      type="text" 
                      name="company_name" 
                      className="w-full bg-muted border border-accent/50 rounded-xl px-4 py-3.5 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="Acme Innovations"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Email Address <span className="text-primary">*</span></label>
                    <input 
                      type="email" 
                      name="email" 
                      required 
                      className="w-full bg-muted border border-accent/50 rounded-xl px-4 py-3.5 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="jane@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Mobile Number <span className="text-primary">*</span></label>
                    <input 
                      type="tel" 
                      name="mobile" 
                      required 
                      pattern="[\+]?[0-9\s\-()]{10,15}"
                      title="Enter a valid phone number with at least 10 digits"
                      className="w-full bg-muted border border-accent/50 rounded-xl px-4 py-3.5 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>
              </section>

              {/* Section 2: Business Profile */}
              <section>
                <div className="flex items-center gap-3 mb-6 border-b border-accent/20 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">2. Business Profile</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Business Type <span className="text-primary">*</span></label>
                    <select 
                      name="business_type" 
                      required
                      className="w-full bg-muted border border-accent/50 rounded-xl px-4 py-3.5 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none transition-all"
                    >
                      <option value="">Select type...</option>
                      <option value="Agency">Digital Agency</option>
                      <option value="Freelancer">Independent Freelancer</option>
                      <option value="Reseller">Technology Reseller</option>
                      <option value="Enterprise">Enterprise Integration</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Website or Portfolio URL</label>
                    <input 
                      type="url" 
                      name="website_url" 
                      className="w-full bg-muted border border-accent/50 rounded-xl px-4 py-3.5 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Geographic Region <span className="text-primary">*</span></label>
                    <select 
                      name="geographic_region" 
                      required
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      className="w-full bg-muted border border-accent/50 rounded-xl px-4 py-3.5 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none transition-all"
                    >
                      <option value="">Select region...</option>
                      {Object.keys(REGION_COUNTRY_MAP).map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Country <span className="text-primary">*</span></label>
                    <select 
                      name="country" 
                      required
                      disabled={!selectedRegion}
                      className="w-full bg-muted border border-accent/50 rounded-xl px-4 py-3.5 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none transition-all disabled:opacity-50"
                    >
                      <option value="">Select country...</option>
                      {selectedRegion && REGION_COUNTRY_MAP[selectedRegion].map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-bold text-foreground mb-4">Services You Offer <span className="text-primary">*</span></label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {['CRM', 'Marketing', 'Development', 'Design', 'Consulting', 'SEO', 'Content'].map((service) => (
                      <label key={service} className="flex items-center space-x-3 bg-muted/50 p-4 rounded-xl border border-accent/20 cursor-pointer hover:border-primary transition-colors group">
                        <input type="checkbox" name="services_interested" value={service} className="w-5 h-5 text-primary bg-background border-accent focus:ring-primary rounded" />
                        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{service}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Why do you want to partner with us? <span className="text-primary">*</span></label>
                  <textarea 
                    name="why_partner" 
                    required 
                    rows="5"
                    className="w-full bg-muted border border-accent/50 rounded-xl px-4 py-3.5 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-y transition-all"
                    placeholder="Tell us about your business goals, your target audience, and how our partnership can be mutually beneficial..."
                  ></textarea>
                </div>
              </section>

              {/* Section 3: Documents */}
              <section>
                <div className="flex items-center gap-3 mb-6 border-b border-accent/20 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">3. Supporting Documents</h2>
                </div>
                
                <div className="bg-muted/30 border-2 border-dashed border-accent/50 rounded-2xl p-8 text-center hover:border-primary transition-colors">
                  <UploadCloud className="w-12 h-12 text-primary mx-auto mb-4" />
                  <p className="text-base font-bold text-foreground mb-2">Upload GST, PAN, Certifications, or Portfolio</p>
                  <p className="text-sm text-muted-foreground mb-6">PDF, JPG, PNG up to 5MB each (Max 5 files)</p>
                  
                  <div className="relative">
                    <input 
                      type="file" 
                      name="documents" 
                      multiple
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="inline-flex items-center justify-center px-6 py-3 bg-primary/10 text-primary font-bold rounded-xl border border-primary/20 pointer-events-none">
                      Select Files
                    </div>
                  </div>
                  
                  {selectedFiles.length > 0 && (
                    <div className="mt-6 text-left bg-background p-4 rounded-xl border border-accent/20">
                      <p className="text-sm font-bold text-foreground mb-2">Selected Files:</p>
                      <ul className="space-y-2">
                        {selectedFiles.map((file, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="truncate">{file.name}</span>
                            <span className="text-xs opacity-70">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>

              {/* Terms & Submit */}
              <div className="pt-6 space-y-8 border-t border-accent/20">
                <label className="flex items-start space-x-4 cursor-pointer bg-muted/20 p-4 rounded-xl border border-accent/10">
                  <input type="checkbox" name="termsAccepted" required className="mt-1 w-5 h-5 text-primary bg-background border-accent focus:ring-primary rounded" />
                  <span className="text-sm text-muted-foreground leading-relaxed">
                    I confirm that the information provided is accurate. I agree to the <a href="/terms" className="text-primary hover:underline font-medium">Terms of Service</a> and acknowledge that my application will be reviewed according to OxgenieEdge partnership criteria. <span className="text-primary">*</span>
                  </span>
                </label>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-extrabold text-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-primary/20 active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Processing Application...
                    </>
                  ) : (
                    <>
                      Submit Partner Application
                      <ArrowRight className="w-6 h-6" />
                    </>
                  )}
                </button>
                
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/30 py-3 rounded-lg border border-accent/10">
                  <AlertCircle className="w-4 h-4 text-primary" /> 
                  <span>AI Scoring is utilized for initial profile review to expedite processing.</span>
                </div>
              </div>

            </form>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}