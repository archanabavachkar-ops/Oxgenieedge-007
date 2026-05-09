import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Loader2 } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient.js';
import { toast } from 'sonner';

export default function RejectApplicationModal({ isOpen, onClose, application, onSuccess }) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!rejectionReason || rejectionReason.trim().length < 10) {
      setError('Rejection reason must be at least 10 characters long.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await apiServerClient.fetch(`/applications/${application.applicationId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to reject application');
      }

      toast.success('Application rejected successfully.');
      onSuccess();
      
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred during rejection.');
      toast.error('Failed to reject application');
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      setRejectionReason('');
      setError('');
    }
  }, [isOpen]);

  if (!application) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl text-destructive">Reject Application</DialogTitle>
          <DialogDescription>
            This will send a rejection email to the applicant with the reason provided below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
              {error}
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4 text-sm">
            <Label className="text-right text-muted-foreground">Applicant</Label>
            <div className="col-span-3 font-medium text-foreground">{application.fullName}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4 text-sm">
            <Label className="text-right text-muted-foreground">Email</Label>
            <div className="col-span-3 font-medium text-foreground">{application.email}</div>
          </div>

          <div className="space-y-2 mt-4">
            <Label className="font-bold text-foreground">
              Rejection Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              value={rejectionReason}
              onChange={(e) => { setRejectionReason(e.target.value); setError(''); }}
              placeholder="Please provide a clear reason for rejection (min 10 characters)..."
              className={`min-h-[100px] bg-background ${error ? 'border-destructive' : ''}`}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isSubmitting}
            className="bg-[#6B7280] text-white hover:bg-[#4B5563] border-transparent"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="bg-[#EF4444] text-white hover:bg-[#DC2626]"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Reject Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}