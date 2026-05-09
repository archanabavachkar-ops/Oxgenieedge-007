import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog.jsx';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { Loader2 } from 'lucide-react';

export default function BulkDeleteDialog({ isOpen, onClose, selectedLeadIds, onSuccess }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!selectedLeadIds || selectedLeadIds.length === 0) {
      toast.error('No leads selected for deletion');
      return;
    }

    setIsDeleting(true);
    try {
      let deletedCount = 0;
      for (const leadId of selectedLeadIds) {
        await pb.collection('leads').delete(leadId, { $autoCancel: false });
        deletedCount++;
      }
      
      toast.success(`Successfully deleted ${deletedCount} lead(s)`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to delete leads:', error);
      toast.error('Failed to delete selected leads');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Selected Leads</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {selectedLeadIds?.length || 0} lead(s)? This action cannot be undone and will permanently remove the data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Leads'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}