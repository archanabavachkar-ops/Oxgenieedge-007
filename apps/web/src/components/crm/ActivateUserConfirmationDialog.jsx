import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';

const ActivateUserConfirmationDialog = ({ isOpen, onClose, onSuccess, user }) => {
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    if (!user) return;

    setLoading(true);
    try {
      try {
        await pb.collection('users').update(user.id, { status: 'active' }, { $autoCancel: false });
      } catch (err) {
        // Fallback if status field doesn't exist in schema
        await pb.collection('users').update(user.id, { verified: true }, { $autoCancel: false });
      }
      toast.success('User activated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error activating user:', error);
      toast.error(error.message || 'Failed to activate user');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !loading && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500">
            <UserCheck className="h-5 w-5" />
            Activate User
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to activate <strong>{user.name || user.email}</strong>? They will be able to login again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              handleActivate();
            }}
            disabled={loading}
            className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Activate
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ActivateUserConfirmationDialog;