import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PasswordInput from '@/components/PasswordInput.jsx';

import apiServerClient from '@/lib/apiServerClient';
import { useAuth } from '@/contexts/AuthContext';

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.string().min(1, "Role is required"),
  department: z.string().optional(),
  phone: z.string().optional(),
  loginUsername: z.string()
    .min(6, "Username must be at least 6 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only alphanumeric characters and underscores allowed"),
  status: z.string().min(1, "Status is required"),
  password: z.string()
    .refine(val => !val || /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(val), {
      message: "Must include uppercase, lowercase, and number (min 8 chars)"
    })
    .optional(),
  confirmPassword: z.string().optional()
}).refine((data) => {
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function EditUserModal({ isOpen, onClose, onSuccess, user }) {
  const { currentUser } = useAuth();
  const [isChecking, setIsChecking] = useState(false);

  const { register, handleSubmit, control, formState: { errors, isSubmitting }, setError, reset } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      role: '',
      department: '',
      phone: '',
      loginUsername: '',
      status: '',
      password: '',
      confirmPassword: ''
    }
  });

  useEffect(() => {
    if (user && isOpen) {
      reset({
        fullName: user.fullName || '',
        email: user.email || '',
        role: user.role || '',
        department: user.department || '',
        phone: user.phone || '',
        loginUsername: user.loginUsername || '',
        status: user.status || 'Active',
        password: '',
        confirmPassword: ''
      });
    }
  }, [user, isOpen, reset]);

  const onSubmit = async (data) => {
    if (!user) return;

    try {
      setIsChecking(true);
      
      // Check email uniqueness if changed
      if (data.email !== user.email) {
        const emailCheckRes = await apiServerClient.fetch(`/crm-users/check-email/${encodeURIComponent(data.email)}`);
        const emailCheck = await emailCheckRes.json();
        if (emailCheck.exists) {
          setError('email', { type: 'manual', message: 'Email is already in use' });
          setIsChecking(false);
          return;
        }
      }

      // Check username uniqueness if changed
      if (data.loginUsername !== user.loginUsername) {
        const usernameCheckRes = await apiServerClient.fetch(`/crm-users/check-username/${encodeURIComponent(data.loginUsername)}`);
        const usernameCheck = await usernameCheckRes.json();
        if (usernameCheck.exists) {
          setError('loginUsername', { type: 'manual', message: 'Username is already taken' });
          setIsChecking(false);
          return;
        }
      }

      setIsChecking(false);

      const payload = {
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        department: data.department || undefined,
        phone: data.phone || undefined,
        loginUsername: data.loginUsername,
        status: data.status
      };

      if (data.password) {
        payload.password = data.password;
      }

      // Update user
      const updateRes = await apiServerClient.fetch(`/crm-users/${user.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const updateData = await updateRes.json();

      if (!updateRes.ok) {
        throw new Error(updateData.error || updateData.message || 'Failed to update user');
      }

      // Log activity
      try {
        await apiServerClient.fetch('/activity-logs/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entityType: 'crm_user',
            entityId: user.userId,
            action: 'CRM User Updated',
            performedBy: currentUser?.id || 'system',
            timestamp: new Date().toISOString()
          })
        });
      } catch (logErr) {
        console.error('Failed to log activity:', logErr);
      }

      toast.success(`User ${data.fullName} updated successfully`);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'An error occurred while updating the user');
    } finally {
      setIsChecking(false);
    }
  };

  const handleOpenChange = (open) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-[#111827] border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Edit CRM User</DialogTitle>
          <DialogDescription className="text-gray-400">
            Update details for {user?.fullName}. Leave password blank to keep current password.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-fullName">Full Name <span className="text-destructive">*</span></Label>
              <Input id="edit-fullName" {...register('fullName')} className="bg-[#1F2937] border-gray-700" />
              {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email Address <span className="text-destructive">*</span></Label>
              <Input id="edit-email" type="email" {...register('email')} className="bg-[#1F2937] border-gray-700" />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-role">Role <span className="text-destructive">*</span></Label>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="bg-[#1F2937] border-gray-700">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1F2937] border-gray-700 text-white">
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Reviewer">Reviewer</SelectItem>
                      <SelectItem value="Support">Support</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-department">Department</Label>
              <Controller
                control={control}
                name="department"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="bg-[#1F2937] border-gray-700">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1F2937] border-gray-700 text-white">
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                      <SelectItem value="Support">Support</SelectItem>
                      <SelectItem value="Management">Management</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.department && <p className="text-sm text-destructive">{errors.department.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input id="edit-phone" {...register('phone')} className="bg-[#1F2937] border-gray-700" />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status <span className="text-destructive">*</span></Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="bg-[#1F2937] border-gray-700">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1F2937] border-gray-700 text-white">
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-loginUsername">Username <span className="text-destructive">*</span></Label>
              <Input id="edit-loginUsername" {...register('loginUsername')} className="bg-[#1F2937] border-gray-700" />
              {errors.loginUsername && <p className="text-sm text-destructive">{errors.loginUsername.message}</p>}
            </div>

            <div className="space-y-2">
              <PasswordInput
                label="New Password (Optional)"
                {...register('password')}
                error={errors.password?.message}
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <PasswordInput
                label="Confirm New Password"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
                placeholder="••••••••"
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting || isChecking} className="border-gray-700 hover:bg-gray-800 text-white">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isChecking} className="bg-[#F97316] text-white hover:bg-[#EA580C]">
              {(isSubmitting || isChecking) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}