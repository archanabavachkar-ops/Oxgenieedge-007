
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import PasswordInput from '@/components/PasswordInput.jsx';

import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.string().min(1, "Role is required"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, "Must include uppercase, lowercase, and number"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function AddUserModal({ isOpen, onClose, onSuccess }) {
  const { currentAdmin } = useAuth();
  const [isChecking, setIsChecking] = useState(false);

  const { register, handleSubmit, control, formState: { errors, isSubmitting }, setError, reset } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      role: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data) => {
    // Explicit runtime validation check
    if (!data.email || !data.password || !data.fullName) {
      toast.error('Email, password, and full name are strictly required.');
      return;
    }

    try {
      setIsChecking(true);
      
      // Check email uniqueness in admin_users collection
      try {
        const existing = await pb.collection('admin_users').getFirstListItem(`email="${data.email}"`, { $autoCancel: false });
        if (existing) {
          setError('email', { type: 'manual', message: 'Email is already in use' });
          setIsChecking(false);
          return;
        }
      } catch (err) {
        if (err.status !== 404) {
          console.error("[AddUserModal] Error checking existing user:", err);
        }
      }

      setIsChecking(false);

      // Construct payload exactly matching the admin_users schema
      // admin_users schema requires: email, password, fullName, role, status
      const createPayload = {
        email: data.email,
        password: data.password, // This is a text field in admin_users schema
        fullName: data.fullName,
        role: data.role,
        status: 'Active'
      };

      try {
        console.log('[AddUserModal] Attempting to create admin_users record.');
        console.log('[AddUserModal] Payload verification:', {
          hasEmail: !!createPayload.email,
          hasPassword: !!createPayload.password,
          hasFullName: !!createPayload.fullName,
          hasRole: !!createPayload.role,
          hasStatus: !!createPayload.status
        });
        
        const newRecord = await pb.collection('admin_users').create(createPayload, { $autoCancel: false });
        
        console.log('[AddUserModal] Record created successfully:', newRecord.id);

        toast.success(`User ${data.fullName} created successfully`);
        reset();
        if (onSuccess) onSuccess();
        onClose();
      } catch (createErr) {
        // EXPLICIT LOGGING FOR POCKETBASE VALIDATION ERRORS
        console.error('[AddUserModal] Error creating admin_users record:', createErr);
        console.error('[AddUserModal] FULL ERROR RESPONSE:', createErr.response?.data || createErr.response || createErr.message);
        console.error('[AddUserModal] Error STATUS:', createErr.status);
        
        if (createErr.response?.data) {
          Object.entries(createErr.response.data).forEach(([field, errData]) => {
            console.error(`[AddUserModal] Validation failed for field '${field}':`, errData.message);
          });
        }
        
        throw createErr;
      }
    } catch (err) {
      toast.error(err.response?.message || err.message || 'An error occurred while creating the user');
    } finally {
      setIsChecking(false);
    }
  };

  const handleOpenChange = (open) => {
    if (!open) {
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle>Add Admin User</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a new user account in the admin_users collection.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
              <Input id="fullName" {...register('fullName')} placeholder="Jane Doe" className="bg-background border-input" />
              {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
              <Input id="email" type="email" {...register('email')} placeholder="jane@example.com" className="bg-background border-input" />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role <span className="text-destructive">*</span></Label>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="bg-background border-input">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CEO">CEO</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Sales Manager">Sales Manager</SelectItem>
                      <SelectItem value="Sales Agent">Sales Agent</SelectItem>
                      <SelectItem value="Viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
            </div>

            <div className="space-y-2">
              <PasswordInput
                label="Password *"
                required
                {...register('password')}
                error={errors.password?.message}
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <PasswordInput
                label="Confirm Password *"
                required
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
                placeholder="••••••••"
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting || isChecking}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isChecking} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {(isSubmitting || isChecking) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
