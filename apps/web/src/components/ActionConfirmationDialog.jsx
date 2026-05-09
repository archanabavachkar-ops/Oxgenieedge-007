import React from 'react';
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogDescription, 
  AlertDialogFooter 
} from '@/components/ui/alert-dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Loader2 } from 'lucide-react';

export default function ActionConfirmationDialog({ 
  isOpen, 
  action, 
  title, 
  message, 
  details, 
  onConfirm, 
  onCancel, 
  isLoading, 
  confirmButtonColor = '#F97316' 
}) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !isLoading && !open && onCancel()}>
      <AlertDialogContent className="bg-[#111827] border-gray-800 text-white sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400 mt-2 space-y-3">
            <p>{message}</p>
            {details && (
              <p className="bg-white/5 p-3 rounded-md border border-white/10 text-sm font-medium text-gray-300">
                {details}
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <Button 
            variant="outline" 
            onClick={onCancel} 
            disabled={isLoading}
            className="bg-[#6B7280] text-white hover:bg-[#4B5563] border-transparent"
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={isLoading}
            style={{ backgroundColor: confirmButtonColor }}
            className="text-white hover:brightness-110"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Confirm
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}