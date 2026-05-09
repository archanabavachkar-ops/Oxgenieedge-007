
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { createLeadFromSource } from '@/lib/crmUtils.js';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';

const SignupPage = () => {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', mobile: '', company: '', password: '', passwordConfirm: '',
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    return strength;
  };

  const strength = getPasswordStrength(formData.password);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.passwordConfirm) {
      toast.error('Passwords do not match.');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      // 1. Check if email already exists
      const existingUsers = await pb.collection('users').getList(1, 1, {
        filter: `email="${formData.email}"`,
        $autoCancel: false
      });

      if (existingUsers.totalItems > 0) {
        toast.error('This email is already registered. Please login or use a different email.');
        setLoading(false);
        return;
      }

      // 2. Proceed with creation
      await pb.collection('users').create({
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
        name: formData.name,
        emailVisibility: true,
        role: 'user'
      }, { $autoCancel: false });

      // 3. Auto create lead for CRM
      try {
        await createLeadFromSource({
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          source: 'signup',
          description: `Company: ${formData.company || 'N/A'}`
        });
      } catch (leadErr) {
        console.warn('Failed to create lead, but user was created:', leadErr);
      }

      // 4. Auto login
      await login(formData.email, formData.password);

      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error("Signup error:", error);
      let errorDescription = error.message || 'An error occurred during signup.';
      if (error.data?.data?.email?.code === 'validation_not_unique' || error.data?.email?.code === 'validation_not_unique') {
        errorDescription = 'This email is already registered. Please login or use a different email.';
      }
      toast.error(errorDescription);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    if (!googleLogin) {
      toast.error('Google signup is not configured.');
      return;
    }
    setGoogleLoading(true);
    googleLogin()
      .then(() => {
        toast.success('Successfully signed up with Google');
        navigate('/dashboard');
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.message || 'Google signup failed. Please try again.');
        setGoogleLoading(false);
      });
  };

  return (
    <>
      <Helmet><title>Sign Up - OxgenieEdge</title></Helmet>
      <Header />
      <div className="min-h-[calc(100vh-80px)] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Create your account</h1>
            <p className="text-slate-600">Join OxgenieEdge and transform your business</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <form onSubmit={handleSignup} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Anika Sharma" className="h-11" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required placeholder="anika@company.com" className="h-11" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input type="tel" id="mobile" name="mobile" value={formData.mobile} onChange={handleChange} required placeholder="+91 9876543210" className="h-11" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="company">Company Name (Optional)</Label>
                <Input type="text" id="company" name="company" value={formData.company} onChange={handleChange} placeholder="Your Company" className="h-11" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input 
                    type={showPassword ? 'text' : 'password'} 
                    id="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    required 
                    placeholder="••••••••" 
                    className="h-11 pr-10" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6B7280] hover:text-primary cursor-pointer bg-transparent transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2 pt-1">
                    <div className="flex gap-1.5 mb-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div key={level} className={`h-1.5 w-full rounded-full ${strength >= level ? strength <= 2 ? 'bg-orange-400' : strength === 3 ? 'bg-yellow-400' : 'bg-green-500' : 'bg-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="passwordConfirm">Confirm Password</Label>
                <div className="relative">
                  <Input 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    id="passwordConfirm" 
                    name="passwordConfirm" 
                    value={formData.passwordConfirm} 
                    onChange={handleChange} 
                    required 
                    placeholder="••••••••" 
                    className="h-11 pr-10" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6B7280] hover:text-primary cursor-pointer bg-transparent transition-colors"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={loading || googleLoading || (formData.password && formData.password !== formData.passwordConfirm)} className="w-full py-6 text-base font-semibold mt-4 rounded-xl">
                {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Creating account...</> : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">Or sign up with</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleGoogleSignup}
                  disabled={loading || googleLoading}
                  className="w-full flex items-center justify-center px-4 py-3.5 border border-slate-300 shadow-sm rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {googleLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2 text-slate-500" />
                  ) : (
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  )}
                  Sign up with Google
                </button>
              </div>
            </div>
            
            <p className="text-center text-sm text-slate-600 mt-6 pt-4 border-t border-slate-100">
              Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Log in</Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
export default SignupPage;
