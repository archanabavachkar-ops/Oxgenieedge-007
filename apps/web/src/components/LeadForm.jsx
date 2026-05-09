
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import pb from '@/lib/pocketbaseClient.js';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  mobile: z.string().min(10, { message: 'Please enter a valid phone number.' }),
});

const LeadForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      mobile: '',
    }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Structure the payload exactly according to the leads collection schema
      const payload = {
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        source: 'Website',
        status: 'New Lead',
        priority: 'Medium'
      };

      console.log('[LeadForm] Submitting new lead to PocketBase:', payload);

      // Use PocketBase client directly to ensure data is written to the correct collection
      const record = await pb.collection('leads').create(payload, { $autoCancel: false });

      console.log('[LeadForm] Lead created successfully in database:', record);

      setIsSuccess(true);
      toast({
        title: "Success!",
        description: "Your demo request has been received. We'll be in touch shortly.",
      });
      reset();
      
      setTimeout(() => setIsSuccess(false), 5000);

    } catch (error) {
      console.error('[LeadForm] Form submission error:', error);
      console.error('[LeadForm] Error details:', error.response || error.message);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "There was a problem submitting your request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[300px] animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">Request Received!</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Thank you for your interest in OxgenieEdge. One of our AI automation specialists will contact you shortly to schedule your free demo.
        </p>
        <Button 
          variant="outline" 
          className="mt-8"
          onClick={() => setIsSuccess(false)}
        >
          Submit Another Request
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-card p-8 rounded-2xl shadow-lg border border-border">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
        <Input 
          id="name" 
          placeholder="Maya Chen" 
          {...register('name')}
          className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
        />
        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="email">Work Email <span className="text-destructive">*</span></Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="maya@company.com" 
            {...register('email')}
            className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
          />
          {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="mobile">Phone Number <span className="text-destructive">*</span></Label>
          <Input 
            id="mobile" 
            type="tel" 
            placeholder="+1 (555) 000-0000" 
            {...register('mobile')}
            className={errors.mobile ? 'border-destructive focus-visible:ring-destructive' : ''}
          />
          {errors.mobile && <p className="text-sm text-destructive mt-1">{errors.mobile.message}</p>}
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full h-12 text-lg font-semibold mt-4" 
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          'Get Free Demo Access'
        )}
      </Button>
      
      <p className="text-xs text-center text-muted-foreground mt-4">
        By submitting this form, you agree to our Privacy Policy and Terms of Service.
      </p>
    </form>
  );
};

export default LeadForm;
