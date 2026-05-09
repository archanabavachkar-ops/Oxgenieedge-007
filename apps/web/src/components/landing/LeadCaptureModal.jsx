import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const LeadCaptureModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Valid email is required";
    if (!formData.phone.trim() || !/^\+?[\d\s-]{8,20}$/.test(formData.phone)) newErrors.phone = "Valid phone number is required";
    if (!formData.company.trim()) newErrors.company = "Company is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    // Simulate API Call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      toast({
        title: "Demo Requested",
        description: "We'll be in touch shortly to schedule your demo.",
      });
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({ name: '', email: '', phone: '', company: '' });
        onClose();
      }, 2000);
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground border-white/10 rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Book a Free Demo</DialogTitle>
          <DialogDescription className="text-muted-foreground text-base">
            See how our AI-powered CRM can transform your revenue pipeline.
          </DialogDescription>
        </DialogHeader>
        
        {isSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-primary" />
            <div className="text-xl font-semibold">Request Received!</div>
            <p className="text-muted-foreground text-sm">Check your inbox for scheduling details.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-background text-foreground border-white/10 focus-visible:ring-primary" 
                placeholder="Maya Chen" 
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Work Email</Label>
              <Input 
                id="email" 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="bg-background text-foreground border-white/10 focus-visible:ring-primary" 
                placeholder="maya@company.com" 
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="bg-background text-foreground border-white/10 focus-visible:ring-primary" 
                placeholder="+1 (555) 000-0000" 
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input 
                id="company" 
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                className="bg-background text-foreground border-white/10 focus-visible:ring-primary" 
                placeholder="Acme Corp" 
              />
              {errors.company && <p className="text-sm text-destructive">{errors.company}</p>}
            </div>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-12 text-base font-semibold bg-gradient-primary text-primary-foreground hover:brightness-110 border-0 rounded-xl"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
              ) : (
                "Get Free Demo"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LeadCaptureModal;