import React, { useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import apiServerClient from '@/lib/apiServerClient';
import { useAuth } from '@/contexts/AuthContext';

export default function DeleteUserConfirmation({ isOpen, onClose, onSuccess, user }) {
  const { currentUser } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const handleDelete = async (force = false) => {
    if (!user) return;

    try {
      setIsDeleting(true);

      // In a real scenario, we might check for active assignments first
      // For this implementation, we'll simulate the check or rely on backend error
      
      const deleteRes = await apiServerClient.fetch(`/crm-users/${user.userId}${force ? '?force=true' : ''}`, {
        method: 'DELETE'
      });

      const deleteData = await deleteRes.json();

      if (!deleteRes.ok) {
        if (deleteRes.status === 409 || deleteData.hasAssignments) {
          setShowWarning(true);
          setIsDeleting(false);
          return;
        }
        throw new Error(deleteData.error || deleteData.message || 'Failed to delete user');
      }

      // Log activity
      try {
        await apiServerClient.fetch('/activity-logs/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entityType: 'crm_user',
            entityId: user.userId,
            action: 'CRM User Deleted',
            performedBy: currentUser?.id || 'system',
            timestamp: new Date().toISOString()
          })
        });
      } catch (logErr) {
        console.error('Failed to log activity:', logErr);
      }

      toast.success(`User ${user.fullName} deleted successfully`);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'An error occurred while deleting the user');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (open) => {
    if (!open && !isDeleting) {
      setShowWarning(false);
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete User?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Are you sure you want to delete <strong>{user?.fullName}</strong>? This action cannot be undone.
            </p>
            <p className="text-muted-foreground">
              All activity logs and assignments will be preserved.
            </p>
            
            {showWarning && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-start gap-2 mt-4">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold">Active Assignments Found</p>
                  <p>This user has active partner assignments. Reassign before deleting, or proceed to delete anyway.</p>
                </div>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              handleDelete(showWarning);
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {showWarning ? 'Proceed Anyway' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}