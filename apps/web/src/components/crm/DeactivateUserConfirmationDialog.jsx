import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, UserMinus } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext';

const DeactivateUserConfirmationDialog = ({ isOpen, onClose, onSuccess, user, allUsers }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleDeactivate = async () => {
    if (!user) return;

    // Validation: Prevent self-deactivation
    if (user.id === currentUser?.id) {
      toast.error('You cannot deactivate your own account');
      onClose();
      return;
    }

    // Validation: Prevent deactivating last admin
    if (user.role === 'admin') {
      const activeAdminCount = allUsers.filter(u => u.role === 'admin' && u.status !== 'inactive').length;
      if (activeAdminCount <= 1) {
        toast.error('Cannot deactivate the last active admin user');
        onClose();
        return;
      }
    }

    setLoading(true);
    try {
      try {
        await pb.collection('users').update(user.id, { status: 'inactive' }, { $autoCancel: false });
      } catch (err) {
        // Fallback if status field doesn't exist in schema
        await pb.collection('users').update(user.id, { verified: false }, { $autoCancel: false });
      }
      toast.success('User deactivated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error deactivating user:', error);
      toast.error(error.message || 'Failed to deactivate user');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !loading && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
            <UserMinus className="h-5 w-5" />
            Deactivate User
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to deactivate <strong>{user.name || user.email}</strong>? They will not be able to login until their account is reactivated.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              handleDeactivate();
            }}
            disabled={loading}
            className="bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Deactivate
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeactivateUserConfirmationDialog;