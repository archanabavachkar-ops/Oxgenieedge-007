import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext';

const DeleteUserConfirmationDialog = ({ isOpen, onClose, onSuccess, user, allUsers }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!user) return;

    // Validation: Prevent self-deletion
    if (user.id === currentUser?.id) {
      toast.error('You cannot delete your own account');
      onClose();
      return;
    }

    // Validation: Prevent deleting last admin
    if (user.role === 'admin') {
      const adminCount = allUsers.filter(u => u.role === 'admin').length;
      if (adminCount <= 1) {
        toast.error('Cannot delete the last admin user');
        onClose();
        return;
      }
    }

    setLoading(true);
    try {
      await pb.collection('users').delete(user.id, { $autoCancel: false });
      toast.success('User deleted successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !loading && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete User
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>Are you sure you want to delete <strong>{user.name || 'this user'}</strong>?</p>
            <p>This action cannot be undone. All data associated with <span className="font-medium text-foreground">{user.email}</span> will be permanently removed.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete User
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteUserConfirmationDialog;