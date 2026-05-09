import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Loader2 } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient.js';
import { toast } from 'sonner';

export default function AssignAccountManagerModal({ isOpen, onClose, application, crmUsers, onSuccess }) {
  const [accountManager, setAccountManager] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!accountManager) {
      setError('Please select a new Account Manager');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await apiServerClient.fetch(`/applications/${application.applicationId}/assign-manager`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountManager })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to assign account manager');
      }

      toast.success('Account Manager assigned successfully.');
      onSuccess();
      
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while assigning manager.');
      toast.error('Failed to assign account manager');
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      setAccountManager('');
      setError('');
    }
  }, [isOpen]);

  if (!application) return null;

  const currentManagerName = crmUsers.find(u => u.id === application.accountManager)?.fullName || 'Unassigned';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl">Assign Account Manager</DialogTitle>
          <DialogDescription>
            Change the assigned account manager for this approved partner.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
              {error}
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4 text-sm">
            <Label className="text-right text-muted-foreground">Partner</Label>
            <div className="col-span-3 font-medium text-foreground">{application.fullName}</div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4 text-sm">
            <Label className="text-right text-muted-foreground">Current Manager</Label>
            <div className="col-span-3 font-medium text-foreground">{currentManagerName}</div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4 mt-4">
            <Label className="text-right font-bold text-foreground">
              New Manager <span className="text-destructive">*</span>
            </Label>
            <div className="col-span-3">
              <Select value={accountManager} onValueChange={(val) => { setAccountManager(val); setError(''); }}>
                <SelectTrigger className={`bg-background ${error ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder="Select New Manager" />
                </SelectTrigger>
                <SelectContent>
                  {crmUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.fullName} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
            className="bg-[#F97316] text-white hover:bg-[#EA580C]"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Assign Manager
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}