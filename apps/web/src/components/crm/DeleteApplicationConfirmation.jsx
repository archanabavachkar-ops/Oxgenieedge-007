import React, { useState } from 'react';
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogDescription, 
  AlertDialogFooter 
} from '@/components/ui/alert-dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Loader2, AlertTriangle } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient.js';
import { toast } from 'sonner';

export default function DeleteApplicationConfirmation({ isOpen, onClose, application, onSuccess }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await apiServerClient.fetch(`/applications/${application.applicationId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete application');
      }

      toast.success('Application deleted successfully.');
      onSuccess();
      
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to delete application');
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  if (!application) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !isDeleting && !open && onClose()}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center text-destructive">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Delete Application?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Are you sure you want to delete the application for <strong>{application.fullName}</strong> ({application.applicationId})? This action cannot be undone.
            </p>
            <p className="bg-destructive/10 text-destructive p-3 rounded-md border border-destructive/20 text-sm font-medium">
              Warning: If this application has been approved, the associated partner account will NOT be deleted.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isDeleting}
            className="bg-[#6B7280] text-white hover:bg-[#4B5563] border-transparent"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            disabled={isDeleting}
            className="bg-[#EF4444] text-white hover:bg-[#DC2626]"
          >
            {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}