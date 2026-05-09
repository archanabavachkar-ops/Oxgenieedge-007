
import React, { useState } from 'react';
import { Input } from '@/components/ui/input.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Label } from '@/components/ui/label.jsx';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';

export default function LeadCaptureForm({ source = 'home', buttonText = "Get Started", className = "" }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!formData.name.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      // Map to exact collection schema
      await pb.collection('leads').create({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        mobile: formData.mobile.trim(), // Optional based on recent schema update
        priority: 'Medium', // Required by schema, setting a default
        status: 'new', // Required by schema, updated enum
        source: source // Required by schema
      }, { $autoCancel: false });
      
      toast.success('Check your email for next steps!');
      
      // Reset form
      setFormData({ name: '', email: '', mobile: '' });
    } catch (error) {
      console.error('Error submitting lead:', error);
      
      // Detailed error handling from PocketBase validation
      if (error.data?.data) {
        const errorMessages = Object.entries(error.data.data)
          .map(([field, errInfo]) => `${field}: ${errInfo.message}`)
          .join(' | ');
          
        if (error.data.data.email?.code === 'validation_not_unique') {
          toast.error('You have already registered with this email.');
        } else {
          toast.error(`Validation failed: ${errorMessages}`);
        }
      } else if (error.message?.includes('duplicate')) {
        toast.error('You have already registered from this page.');
      } else {
        toast.error('Failed to submit. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-4 w-full max-w-md mx-auto ${className}`}>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 space-y-2">
          <Label htmlFor="name" className="sr-only">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Your name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="h-12 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary text-foreground placeholder:text-muted-foreground transition-all duration-300"
          />
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor="email" className="sr-only">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="h-12 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary text-foreground placeholder:text-muted-foreground transition-all duration-300"
          />
        </div>
      </div>
      
      {/* Mobile input (Optional) */}
      <div className="space-y-2 hidden">
        <Label htmlFor="mobile" className="sr-only">Mobile Number</Label>
        <Input
          id="mobile"
          type="tel"
          placeholder="Mobile number (optional)"
          value={formData.mobile}
          onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
          className="h-12 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary text-foreground placeholder:text-muted-foreground transition-all duration-300"
        />
      </div>

      <Button 
        type="submit" 
        disabled={isLoading}
        className="h-12 w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
      >
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : buttonText}
      </Button>
    </form>
  );
}
